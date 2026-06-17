from allauth.socialaccount.adapter import DefaultSocialAccountAdapter


class SocialAccountAdapter(DefaultSocialAccountAdapter):
    """Popula full_name/avatar do nosso User a partir dos dados do provedor (Google)."""

    def populate_user(self, request, sociallogin, data):
        user = super().populate_user(request, sociallogin, data)

        extra = getattr(sociallogin.account, "extra_data", {}) or {}
        name = (
            data.get("name")
            or extra.get("name")
            or " ".join(filter(None, [data.get("first_name"), data.get("last_name")])).strip()
        )
        if name and not user.full_name:
            user.full_name = name[:150]

        picture = data.get("picture") or extra.get("picture")
        if picture and not user.avatar_url:
            user.avatar_url = picture

        return user
