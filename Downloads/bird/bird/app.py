import os
import json
import math
import sqlite3
import datetime

import numpy as np
import pandas as pd
import streamlit as st
from PIL import Image

# ------------------------------------------------------------
# PAGE CONFIGURATION AND PATHS
# ------------------------------------------------------------

st.set_page_config(
    page_title="Bengaluru Bird Biodiversity Monitor",
    page_icon="🐦",
    layout="wide",
)

BASE = os.path.dirname(os.path.abspath(__file__))

DB_PATH = os.path.join(BASE, "bird_observations.db")
MODEL_PATH = os.path.join(BASE, "bird_model_direct.keras")
CLASSES_PATH = os.path.join(BASE, "bird_classes.json")

IMAGE_SIZE = 160
LOW_CONFIDENCE = 0.60

SEASON_ORDER = [
    "Winter",
    "Summer",
    "Monsoon",
    "Post-monsoon",
]

SITES = [
    ("Hebbal Lake", 13.0450, 77.5900, "Wetland"),
    ("Sankey Tank", 13.0100, 77.5710, "Wetland"),
    ("Ulsoor Lake", 12.9830, 77.6200, "Wetland"),
    ("Bellandur Lake", 12.9370, 77.6710, "Wetland"),
    ("Varthur Lake", 12.9380, 77.7400, "Wetland"),
    ("Jakkur Lake", 13.0780, 77.6080, "Wetland"),
    ("Lalbagh", 12.9507, 77.5848, "Park/Garden"),
    ("Cubbon Park", 12.9763, 77.5929, "Park/Garden"),
    ("GKVK Campus", 13.0750, 77.5800, "Open/Agricultural"),
    ("Hesaraghatta", 13.1400, 77.4900, "Open/Agricultural"),
    ("Turahalli Forest", 12.8999, 77.5100, "Scrub/Forest"),
    ("Bannerghatta NP", 12.8000, 77.5770, "Scrub/Forest"),
]

SITE_RADIUS_KM = 2.0


# ------------------------------------------------------------
# HELPER FUNCTIONS
# ------------------------------------------------------------

def season_of(month):

    if month in (12, 1, 2):
        return "Winter"

    if month in (3, 4, 5):
        return "Summer"

    if month in (6, 7, 8, 9):
        return "Monsoon"

    return "Post-monsoon"


def haversine(lat1, lon1, lat2, lon2):

    radius = 6371.0

    p1 = math.radians(lat1)
    p2 = math.radians(lat2)

    a = (
        math.sin((p2 - p1) / 2) ** 2
        + math.cos(p1)
        * math.cos(p2)
        * math.sin(math.radians(lon2 - lon1) / 2) ** 2
    )

    return 2 * radius * math.asin(math.sqrt(a))


def assign_site(lat, lon):

    nearest = min(
        SITES,
        key=lambda site: haversine(
            lat, lon, site[1], site[2]
        )
    )

    distance = haversine(
        lat, lon,
        nearest[1], nearest[2]
    )

    if distance <= SITE_RADIUS_KM:
        return nearest[0], nearest[3]

    return "Other (urban/residential)", "Urban"


# ------------------------------------------------------------
# LOAD MOBILENETV2 MODEL
# ------------------------------------------------------------

@st.cache_resource(show_spinner="Loading MobileNetV2 model...")
def load_model():

    import tensorflow as tf

    if not os.path.isfile(MODEL_PATH):
        raise FileNotFoundError(
            "bird_model_direct.keras was not found. "
            "Place it in the same folder as app.py."
        )

    if not os.path.isfile(CLASSES_PATH):
        raise FileNotFoundError(
            "bird_classes.json was not found. "
            "Place it in the same folder as app.py."
        )

    model = tf.keras.models.load_model(
        MODEL_PATH,
        compile=False
    )

    with open(CLASSES_PATH, "r", encoding="utf-8") as file:
        classes = json.load(file)

    return model, classes


# ------------------------------------------------------------
# IMAGE PREDICTION
# ------------------------------------------------------------

def predict_image(pil_image):

    import tensorflow as tf

    model, classes = load_model()

    image = pil_image.convert("RGB")

    image = image.resize(
        (IMAGE_SIZE, IMAGE_SIZE),
        Image.Resampling.BILINEAR
    )

    array = np.asarray(
        image,
        dtype=np.float32
    )

    array = tf.keras.applications.mobilenet_v2.preprocess_input(
        array
    )

    probabilities = model.predict(
        np.expand_dims(array, axis=0),
        verbose=0
    )[0]

    order = np.argsort(probabilities)[::-1]

    predictions = [
        (
            classes[int(i)],
            float(probabilities[int(i)])
        )
        for i in order
    ]

    return predictions


# ------------------------------------------------------------
# DATABASE FUNCTIONS
# ------------------------------------------------------------

def read_sql(query, params=()):

    if not os.path.isfile(DB_PATH):
        return pd.DataFrame()

    with sqlite3.connect(DB_PATH) as connection:

        return pd.read_sql_query(
            query,
            connection,
            params=params
        )


def save_observation(
    species,
    observed_date,
    lat,
    lon,
    site,
    habitat,
    confidence
):

    with sqlite3.connect(DB_PATH) as connection:

        connection.execute(
            """
            INSERT INTO observations
            (
                source,
                gbif_id,
                species,
                observed_date,
                year,
                month,
                season,
                lat,
                lon,
                site,
                habitat,
                confidence,
                dataset
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "dashboard_upload",
                None,
                species,
                observed_date.isoformat(),
                observed_date.year,
                observed_date.month,
                season_of(observed_date.month),
                float(lat),
                float(lon),
                site,
                habitat,
                float(confidence),
                "dashboard",
            ),
        )


# ------------------------------------------------------------
# MAIN DASHBOARD
# ------------------------------------------------------------

st.title(
    "🐦 AI-Based Bird Biodiversity Monitoring: Bengaluru"
)

st.caption(
    "Bird identification powered by your trained MobileNetV2 model"
)

tab_identify, tab_insights, tab_observations, tab_about = st.tabs(
    [
        "Identify a bird",
        "Biodiversity insights",
        "My observations",
        "About & limitations",
    ]
)


# ------------------------------------------------------------
# TAB 1: IDENTIFY A BIRD
# ------------------------------------------------------------

with tab_identify:

    st.subheader("Upload a bird photo")

    st.write(
        "Choose a JPG, JPEG, or PNG image. "
        "The full image is classified; YOLO cropping is not used."
    )

    uploaded_file = st.file_uploader(
        "Choose a bird image",
        type=["jpg", "jpeg", "png"],
        key="bird_image_upload",
        help="Upload a clear photograph containing one bird.",
    )

    if uploaded_file is not None:

        try:

            original_image = Image.open(
                uploaded_file
            ).convert("RGB")

            left, right = st.columns(2)

            left.image(
                original_image,
                caption="Uploaded bird photograph",
                use_container_width=True
            )

            with st.spinner(
                "Classifying image with MobileNetV2..."
            ):

                predictions = predict_image(
                    original_image
                )

            predicted_species, confidence = predictions[0]

            with right:

                st.success("Prediction completed")

                st.metric(
                    "Predicted species",
                    predicted_species
                )

                st.progress(
                    min(max(confidence, 0.0), 1.0),
                    text=f"Confidence: {confidence * 100:.1f}%"
                )

                st.markdown("**Other predictions**")

                for species, probability in predictions[1:3]:

                    st.write(
                        f"- {species}: {probability * 100:.1f}%"
                    )

            if confidence < LOW_CONFIDENCE:

                st.warning(
                    "Confidence is below 60%. "
                    "Please verify the identification manually. "
                    "The model recognizes only five species."
                )

            st.markdown("### Record this observation")

            col_date, col_site = st.columns(2)

            observed_date = col_date.date_input(
                "Date observed",
                value=datetime.date.today()
            )

            site_options = [
                site[0] for site in SITES
            ] + [
                "Other location (enter coordinates)"
            ]

            selected_site = col_site.selectbox(
                "Observation location",
                site_options
            )

            if selected_site == "Other location (enter coordinates)":

                col_lat, col_lon = st.columns(2)

                latitude = col_lat.number_input(
                    "Latitude",
                    value=12.97000,
                    format="%.5f"
                )

                longitude = col_lon.number_input(
                    "Longitude",
                    value=77.59000,
                    format="%.5f"
                )

                site_name, habitat_name = assign_site(
                    latitude,
                    longitude
                )

            else:

                site_record = next(
                    site for site in SITES
                    if site[0] == selected_site
                )

                site_name, latitude, longitude, habitat_name = site_record

            st.caption(
                f"Season: **{season_of(observed_date.month)}** | "
                f"Habitat: **{habitat_name}** | "
                f"Site: **{site_name}**"
            )

            manually_verified = True

            if confidence < LOW_CONFIDENCE:

                manually_verified = st.checkbox(
                    "I have checked this identification myself"
                )

            if st.button(
                "Save observation",
                type="primary",
                disabled=not manually_verified
            ):

                try:

                    save_observation(
                        predicted_species,
                        observed_date,
                        latitude,
                        longitude,
                        site_name,
                        habitat_name,
                        confidence,
                    )

                    st.success(
                        "Observation saved successfully."
                    )

                except Exception as error:

                    st.error(
                        f"Could not save observation: {error}"
                    )

        except Exception as error:

            st.error(
                f"Could not process this image: {error}"
            )

            st.info(
                "Check that bird_model_direct.keras and "
                "bird_classes.json are in the same folder "
                "as app.py, and that TensorFlow is installed."
            )


# ------------------------------------------------------------
# TAB 2: BIODIVERSITY INSIGHTS
# ------------------------------------------------------------

with tab_insights:

    st.subheader("Biodiversity insights")

    try:

        rates = read_sql(
            "SELECT * FROM species_rates"
        )

        observations = read_sql(
            """
            SELECT species, season, habitat, lat, lon, year
            FROM observations
            """
        )

        if rates.empty:

            st.info(
                "The species_rates table has no data in the database."
            )

        else:

            species_all = sorted(
                rates["species"].dropna().unique().tolist()
            )

            selected_species = st.multiselect(
                "Species",
                species_all,
                default=species_all
            )

            if selected_species:

                selected_rates = rates[
                    rates["species"].isin(selected_species)
                ].copy()

                selected_observations = (
                    observations[
                        observations["species"].isin(selected_species)
                    ].copy()
                    if not observations.empty
                    else observations
                )

                st.caption(
                    "Rates are recorded observations per 1,000 bird records. "
                    "They describe recording patterns, not direct population counts."
                )

                if "rate_per_1000" in selected_rates.columns:

                    seasonal = selected_rates.groupby(
                        ["species", "season"],
                        as_index=False
                    )["rate_per_1000"].mean()

                    yearly = selected_rates.groupby(
                        ["species", "year"],
                        as_index=False
                    )["rate_per_1000"].mean()

                    c1, c2 = st.columns(2)

                    c1.markdown("**Seasonal pattern**")

                    season_pivot = seasonal.pivot(
                        index="season",
                        columns="species",
                        values="rate_per_1000"
                    )

                    c1.bar_chart(
                        season_pivot.reindex(
                            [
                                s for s in SEASON_ORDER
                                if s in season_pivot.index
                            ]
                        )
                    )

                    c2.markdown("**Yearly trend**")

                    year_pivot = yearly.pivot(
                        index="year",
                        columns="species",
                        values="rate_per_1000"
                    )

                    c2.line_chart(year_pivot)

                if (
                    not selected_observations.empty
                    and {"species", "habitat"}.issubset(
                        selected_observations.columns
                    )
                ):

                    st.markdown(
                        "**Habitat share of records**"
                    )

                    habitat_counts = selected_observations.groupby(
                        ["species", "habitat"]
                    ).size().unstack(fill_value=0)

                    habitat_percent = (
                        habitat_counts.div(
                            habitat_counts.sum(axis=1),
                            axis=0
                        ) * 100
                    )

                    st.bar_chart(habitat_percent)

                    if {"lat", "lon"}.issubset(
                        selected_observations.columns
                    ):

                        st.markdown(
                            "**Where records come from**"
                        )

                        map_species = st.selectbox(
                            "Species for map",
                            selected_species
                        )

                        map_season = st.selectbox(
                            "Season",
                            ["All"] + SEASON_ORDER
                        )

                        map_data = selected_observations[
                            selected_observations["species"] == map_species
                        ]

                        if map_season != "All":

                            map_data = map_data[
                                map_data["season"] == map_season
                            ]

                        map_data = map_data[
                            ["lat", "lon"]
                        ].dropna()

                        if not map_data.empty:

                            st.map(
                                map_data.sample(
                                    min(2000, len(map_data)),
                                    random_state=0
                                )
                            )

                        else:

                            st.info(
                                "No coordinates are available for this selection."
                            )

                shift = read_sql(
                    "SELECT * FROM shift_results"
                )

                if not shift.empty:

                    st.markdown(
                        "**Distribution-shift indicators "
                        "(2018–2021 vs 2022–2025)**"
                    )

                    st.dataframe(
                        shift[
                            shift["species"].isin(selected_species)
                        ],
                        use_container_width=True,
                        hide_index=True
                    )

                spatial = read_sql(
                    "SELECT * FROM spatial_shift"
                )

                if not spatial.empty:

                    st.markdown(
                        "**Spatial and habitat shift**"
                    )

                    st.dataframe(
                        spatial[
                            spatial["species"].isin(selected_species)
                        ],
                        use_container_width=True,
                        hide_index=True
                    )

                st.caption(
                    "A shift flag is a prompt for further investigation, "
                    "not proof that the real bird population changed."
                )

            else:

                st.info(
                    "Select at least one species to view insights."
                )

    except Exception as error:

        st.warning(
            f"Could not load biodiversity insights: {error}"
        )


# ------------------------------------------------------------
# TAB 3: MY OBSERVATIONS
# ------------------------------------------------------------

with tab_observations:

    st.subheader(
        "Observations saved from this dashboard"
    )

    try:

        mine = read_sql(
            """
            SELECT
                observed_date,
                species,
                confidence,
                site,
                habitat,
                season,
                lat,
                lon
            FROM observations
            WHERE source='dashboard_upload'
            ORDER BY id DESC
            """
        )

        if mine.empty:

            st.info(
                "No observations saved yet. "
                "Identify a bird in the first tab and click Save observation."
            )

        else:

            st.dataframe(
                mine,
                use_container_width=True,
                hide_index=True
            )

            st.download_button(
                "Download my observations as CSV",
                data=mine.to_csv(
                    index=False
                ).encode("utf-8"),
                file_name="my_bird_observations.csv",
                mime="text/csv",
            )

    except Exception as error:

        st.error(
            f"Could not load saved observations: {error}"
        )


# ------------------------------------------------------------
# TAB 4: ABOUT AND LIMITATIONS
# ------------------------------------------------------------

with tab_about:

    st.subheader("About the project")

    st.markdown(
        """
**How it works:**

The dashboard uses a MobileNetV2 image classifier trained on
4,796 images across five bird species.

Images are resized to 160 × 160 pixels and preprocessed using
MobileNetV2 preprocessing.

The model classifies the full uploaded photograph.
No YOLO bird detection or cropping is used.

**Model evaluation:**

The reported held-out test accuracy from training was 83.61%.

**Limitations:**

- The classifier recognizes only five species.
- Other bird species may be incorrectly assigned to one of them.
- Confidence is not a guarantee of correctness.
- Training images may differ from everyday photographs.
- Dashboard observations record sightings, not true bird abundance.
- Habitat is approximated using the nearest reference site within 2 km.
- Biodiversity trends can be affected by observation effort and reporting bias.
        """
    )

    st.divider()

    st.markdown(
        "**Model:** MobileNetV2  \n"
        "**Image size:** 160 × 160  \n"
        "**Number of classes:** 5  \n"
        "**Test accuracy:** 83.61%"
    )