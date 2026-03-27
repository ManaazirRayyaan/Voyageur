from django import forms

from .models import Package


class PackageFilterForm(forms.Form):
    q = forms.CharField(required=False)
    destination = forms.CharField(required=False)
    min_price = forms.DecimalField(required=False, min_value=0)
    max_price = forms.DecimalField(required=False, min_value=0)
    duration = forms.ChoiceField(
        required=False,
        choices=[
            ("", "All durations"),
            ("short", "1-4 days"),
            ("medium", "5-8 days"),
            ("long", "9+ days"),
        ],
    )
    rating = forms.FloatField(required=False, min_value=0, max_value=5)
    category = forms.ChoiceField(required=False, choices=[("", "All categories")])
    vibe = forms.ChoiceField(required=False, choices=[("", "All vibes")])

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["category"].choices = [("", "All categories")] + [
            (value, value.replace("/", " / ").title())
            for value in Package.objects.exclude(category="").values_list("category", flat=True).distinct().order_by("category")
        ]
        self.fields["vibe"].choices = [("", "All vibes")] + [
            (value, value.title())
            for value in Package.objects.exclude(vibe="").values_list("vibe", flat=True).distinct().order_by("vibe")
        ]
        base_class = "w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
        for field in self.fields.values():
            field.widget.attrs["class"] = base_class
