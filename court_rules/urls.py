from django.urls import include, path

app_name = "court_rules"

urlpatterns = [
    path("v1/", include("court_rules.api.v1.urls")),
]
