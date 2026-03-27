from django import forms
from django.core.exceptions import ValidationError

from packages.models import Destination, Hotel, Package, Transport

from .models import Booking


class FormStyleMixin:
    default_class = "w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-500"

    def apply_styles(self):
        for field in self.fields.values():
            field.widget.attrs.setdefault("class", self.default_class)


class BookingForm(FormStyleMixin, forms.ModelForm):
    class Meta:
        model = Booking
        fields = ["hotel", "transport", "travelers", "start_date", "end_date"]
        widgets = {
            "start_date": forms.DateInput(attrs={"type": "date"}),
            "end_date": forms.DateInput(attrs={"type": "date"}),
        }

    def __init__(self, *args, package=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.package = package
        self.instance.package = package
        self.instance.destination = package.destination if package else None
        self.instance.trip_type = Booking.PACKAGE
        self.fields["hotel"].queryset = (
            package.hotels.all() if package and package.hotels.exists() else Hotel.objects.filter(destination=package.destination)
        )
        self.fields["transport"].queryset = (
            package.transports.all() if package and package.transports.exists() else Transport.objects.all()
        )
        self.fields["travelers"].min_value = 1
        self.apply_styles()

    def save(self, commit=True):
        booking = super().save(commit=False)
        booking.package = self.package
        booking.trip_type = Booking.PACKAGE
        booking.destination = self.package.destination
        booking.total_price = booking.calculate_total()
        booking.status = Booking.CONFIRMED
        if commit:
            booking.save()
        return booking


class CustomTripForm(FormStyleMixin, forms.ModelForm):
    destination = forms.ModelChoiceField(queryset=Destination.objects.all())

    class Meta:
        model = Booking
        fields = ["destination", "hotel", "transport", "travelers", "start_date", "end_date", "custom_notes"]
        widgets = {
            "start_date": forms.DateInput(attrs={"type": "date"}),
            "end_date": forms.DateInput(attrs={"type": "date"}),
            "custom_notes": forms.Textarea(attrs={"rows": 4, "placeholder": "Special requests or activities"}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.instance.trip_type = Booking.CUSTOM
        self.fields["travelers"].min_value = 1
        self.fields["hotel"].queryset = Hotel.objects.select_related("destination")
        self.fields["transport"].queryset = Transport.objects.all()
        self.apply_styles()

    def clean(self):
        cleaned_data = super().clean()
        destination = cleaned_data.get("destination")
        hotel = cleaned_data.get("hotel")
        self.instance.destination = destination
        self.instance.trip_type = Booking.CUSTOM
        if hotel and destination and hotel.destination_id != destination.id:
            raise ValidationError("Hotel must belong to the selected destination.")
        return cleaned_data

    def save(self, commit=True):
        booking = super().save(commit=False)
        booking.trip_type = Booking.CUSTOM
        booking.total_price = booking.calculate_total()
        booking.status = Booking.CONFIRMED
        if commit:
            booking.save()
        return booking
