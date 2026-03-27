from django.http import JsonResponse
from django.contrib import messages
from django.contrib.auth import login, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView, PasswordResetCompleteView, PasswordResetConfirmView, PasswordResetDoneView, PasswordResetView
from django.shortcuts import get_object_or_404, redirect, render

from packages.models import Package

from .forms import LoginForm, ProfileForm, RegistrationForm, generate_username_suggestions
from .models import Wishlist


class UserLoginView(LoginView):
    template_name = "users/login.html"
    authentication_form = LoginForm
    redirect_authenticated_user = True

    def form_invalid(self, form):
        messages.error(self.request, "Login failed. Use your username or email and a valid password.")
        return super().form_invalid(form)


def register_view(request):
    if request.user.is_authenticated:
        return redirect("dashboard:user_dashboard")

    form = RegistrationForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        user = form.save()
        login(request, user, backend="users.backends.EmailOrUsernameBackend")
        messages.success(request, "Your account has been created.")
        return redirect("dashboard:user_dashboard")
    return render(
        request,
        "users/register.html",
        {
            "form": form,
            "username_suggestions": getattr(form, "username_suggestions", []),
        },
    )


def logout_view(request):
    logout(request)
    messages.success(request, "You have been logged out.")
    return redirect("dashboard:home")


class ForgotPasswordView(PasswordResetView):
    template_name = "users/forgot_password.html"
    email_template_name = "users/password_reset_email.txt"
    subject_template_name = "users/password_reset_subject.txt"
    success_url = "/forgot-password/done/"


class ForgotPasswordDoneView(PasswordResetDoneView):
    template_name = "users/password_reset_done.html"


class ResetPasswordConfirmView(PasswordResetConfirmView):
    template_name = "users/password_reset_confirm.html"
    success_url = "/reset-password/complete/"


class ResetPasswordCompleteView(PasswordResetCompleteView):
    template_name = "users/password_reset_complete.html"


@login_required
def profile_settings(request):
    profile = request.user.profile
    form = ProfileForm(request.POST or None, request.FILES or None, instance=profile, user=request.user)
    if request.method == "POST" and form.is_valid():
        password_changed = bool(form.cleaned_data.get("new_password1"))
        form.save()
        if password_changed:
            update_session_auth_hash(request, request.user)
            messages.success(request, "Profile updated and password changed successfully.")
        else:
            messages.success(request, "Profile settings updated.")
        return redirect("dashboard:user_dashboard")
    return render(request, "users/profile_settings.html", {"form": form})


@login_required
def toggle_saved_package(request, slug):
    package = get_object_or_404(Package, slug=slug)
    profile = request.user.profile
    wishlist_item = Wishlist.objects.filter(user=request.user, package=package)
    if wishlist_item.exists():
        wishlist_item.delete()
        profile.saved_packages.remove(package)
        messages.success(request, "Package removed from wishlist.")
    else:
        Wishlist.objects.create(user=request.user, package=package)
        profile.saved_packages.add(package)
        messages.success(request, "Package added to wishlist.")
    return redirect(request.POST.get("next") or request.META.get("HTTP_REFERER") or "packages:list")


def username_suggestions_view(request):
    username = request.GET.get("username", "").strip()
    if not username:
        return JsonResponse({"suggestions": []})
    return JsonResponse({"suggestions": generate_username_suggestions(username)})


@login_required
def wishlist_view(request):
    wishlist_items = Wishlist.objects.select_related("package", "package__destination").filter(user=request.user)
    return render(request, "users/wishlist.html", {"wishlist_items": wishlist_items})
