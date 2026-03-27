from django import forms

from packages.models import Destination

from .models import Review


class ReviewForm(forms.ModelForm):
    destination = forms.ModelChoiceField(
        queryset=Destination.objects.all(),
        required=False,
        widget=forms.Select(attrs={"class": "w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"}),
    )

    class Meta:
        model = Review
        fields = ["destination", "rating", "comment"]
        widgets = {
            "rating": forms.NumberInput(
                attrs={"min": 1, "max": 5, "class": "w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"}
            ),
            "comment": forms.Textarea(
                attrs={"rows": 4, "class": "w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"}
            ),
        }
