<!-- 
  @component
  Renders a social entry as a boxed list item with an action link.
  Usage:
  <SocialCard platform="GitHub" handle="@user" url="https://..." icon="/github.svg" />
  Optional: pass `class` to extend/override wrapper spacing.
-->

<script lang="ts">
  let { platform, handle, url, icon, class: className = "" } = $props();
</script>

<li class="card flex items-center justify-between {className}">
  <div class="flex items-center gap-4">
    <img src={icon} alt={platform} class="h-6 w-6" />
    <div>
      <span class="text-strong">{platform}</span>
      <p class="text-muted">{handle}</p>
    </div>
  </div>
  <a class="btn-ghost link-action" href={url} target="_blank" rel="noreferrer">
    Open
  </a>
</li>
