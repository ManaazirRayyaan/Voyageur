from django import forms
from django.contrib.auth import password_validation
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

from .models import Profile


def generate_username_suggestions(username):
    base = "".join(ch for ch in username.lower() if ch.isalnum() or ch == "_") or "traveler"
    suggestions = [f"{base}123", f"{base}_01", f"{base}{User.objects.count() + 7}"]
    unique_suggestions = []
    for suggestion in suggestions:
        if suggestion not in unique_suggestions and not User.objects.filter(username=suggestion).exists():
            unique_suggestions.append(suggestion)
    if not unique_suggestions:
        unique_suggestions.append(f"{base}{User.objects.count() + 101}")
    return unique_suggestions


class StyledFormMixin:
    default_class = "w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-500"

    def apply_styles(self):
        for field in self.fields.values():
            field.widget.attrs.setdefault("class", self.default_class)


class RegistrationForm(StyledFormMixin, UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ("first_name", "last_name", "username", "email", "password1", "password2")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["first_name"].widget.attrs["placeholder"] = "First name"
        self.fields["last_name"].widget.attrs["placeholder"] = "Last name"
        self.fields["username"].widget.attrs["placeholder"] = "Username"
        self.fields["email"].widget.attrs["placeholder"] = "Email address"
        self.fields["password1"].widget.attrs["placeholder"] = "Password"
        self.fields["password2"].widget.attrs["placeholder"] = "Confirm password"
        self.fields["email"].widget.attrs["autocomplete"] = "email"
        self.apply_styles()

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise ValidationError("An account with this email already exists.")
        return email

    def clean_username(self):
        username = self.cleaned_data["username"].strip()
        if User.objects.filter(username__iexact=username).exists():
            self.username_suggestions = generate_username_suggestions(username)
            raise ValidationError(
                f"That username is already taken. Try: {', '.join(self.username_suggestions)}"
            )
        return username

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user


class LoginForm(StyledFormMixin, AuthenticationForm):
    username = forms.CharField(
        label="Username or Email",
        widget=forms.TextInput(attrs={"placeholder": "Username or email"})
    )
    password = forms.CharField(widget=forms.PasswordInput(attrs={"placeholder": "Password"}))
    error_messages = {
        "invalid_login": _("Please enter a valid username/email and password."),
        "inactive": _("This account is inactive."),
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.apply_styles()


class ProfileForm(StyledFormMixin, forms.ModelForm):
    full_name = forms.CharField(max_length=255, required=False)
    username = forms.CharField(max_length=150)
    email = forms.EmailField(required=True)
    new_password1 = forms.CharField(
        required=False,
        widget=forms.PasswordInput(attrs={"placeholder": "New password"}),
        help_text="Leave blank if you do not want to change your password.",
    )
    new_password2 = forms.CharField(
        required=False,
        widget=forms.PasswordInput(attrs={"placeholder": "Confirm new password"}),
    )

    class Meta:
        model = Profile
        fields = ("age", "gender", "phone", "profile_image")

    def __init__(self, *args, **kwargs):
        user = kwargs.pop("user")
        super().__init__(*args, **kwargs)
        self.user = user
        self.fields["full_name"].initial = user.get_full_name()
        self.fields["username"].initial = user.username
        self.fields["email"].initial = user.email
        self.fields["age"].widget.attrs["placeholder"] = "Age"
        self.fields["gender"].widget.attrs["placeholder"] = "Gender"
        self.fields["phone"].widget.attrs["placeholder"] = "Phone number"
        self.apply_styles()

    def clean_username(self):
        username = self.cleaned_data["username"].strip()
        qs = User.objects.filter(username__iexact=username).exclude(pk=self.user.pk)
        if qs.exists():
            raise ValidationError(
                f"Username already exists. Try: {', '.join(generate_username_suggestions(username))}"
            )
        return username

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        qs = User.objects.filter(email__iexact=email).exclude(pk=self.user.pk)
        if qs.exists():
            raise ValidationError("Another account already uses this email.")
        return email

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get("new_password1")
        password2 = cleaned_data.get("new_password2")

        if password1 or password2:
            if password1 != password2:
                raise ValidationError("New passwords do not match.")
            password_validation.validate_password(password1, self.user)
        return cleaned_data

    def save(self, commit=True):
        profile = super().save(commit=False)
        full_name = self.cleaned_data["full_name"].strip()
        parts = full_name.split(maxsplit=1) if full_name else ["", ""]
        first_name = parts[0] if parts else ""
        last_name = parts[1] if len(parts) > 1 else ""
        self.user.first_name = first_name
        self.user.last_name = last_name
        self.user.username = self.cleaned_data["username"]
        self.user.email = self.cleaned_data["email"]
        if commit:
            self.user.save()
            if self.cleaned_data.get("new_password1"):
                self.user.set_password(self.cleaned_data["new_password1"])
                self.user.save()
            profile.user = self.user
            profile.save()
            self.save_m2m()
        return profile
