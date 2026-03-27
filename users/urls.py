from django.urls import path

from .views import (
    ForgotPasswordDoneView,
    ForgotPasswordView,
    ResetPasswordCompleteView,
    ResetPasswordConfirmView,
    UserLoginView,
    logout_view,
    profile_settings,
    register_view,
    toggle_saved_package,
    username_suggestions_view,
    wishlist_view,
)

app_name = "users"

urlpatterns = [
    path("login/", UserLoginView.as_view(), name="login"),
    path("register/", register_view, name="register"),
    path("logout/", logout_view, name="logout"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot_password"),
    path("forgot-password/done/", ForgotPasswordDoneView.as_view(), name="password_reset_done"),
    path("reset-password/<uidb64>/<token>/", ResetPasswordConfirmView.as_view(), name="password_reset_confirm"),
    path("reset-password/complete/", ResetPasswordCompleteView.as_view(), name="password_reset_complete"),
    path("register/username-suggestions/", username_suggestions_view, name="username_suggestions"),
    path("profile/settings/", profile_settings, name="profile_settings"),
    path("wishlist/", wishlist_view, name="wishlist"),
    path("saved-packages/<slug:slug>/toggle/", toggle_saved_package, name="toggle_saved_package"),
]
