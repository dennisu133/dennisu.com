# dennisu.com

# Architecture

- Organize code by feature. Keep feature-specific components, logic, state,
  types, assets, and tests together in the owning directory.
- Keep dependencies pointing from features to shared code. Shared code must
  not depend on feature internals, and features must not reach into one
  another's implementation.
- Look for existing solutions before writing new code. Reuse suitable project
  code, established patterns, platform APIs, and installed dependencies.
- Keep code in the narrowest scope that owns it. Move it to a shared location
  only when multiple features actually need it, with no dependency on either
  feature.
- Avoid speculative abstractions. Do not force unrelated features through a
  shared abstraction merely because their code looks similar.

# Styling

- Never use rounded corners.
- Use Tailwind utilities in markup for layout, spacing, typography, appearance,
  responsive behavior, and interaction states.
- Prefer Tailwind's default scale and the project's existing semantic theme
  tokens. Use familiar spacing steps (including `1.5`, `2.5`, and `3.5`), named
  text sizes, font weights, shadows, and breakpoints before custom values.
  Choose the nearest suitable scale value instead of preserving incidental CSS
  measurements: for example, prefer `gap-1.5` over `gap-[0.35rem]`, `px-5` over
  `px-[1.2rem]`, and `text-sm` over `text-[0.9rem]` when no functional constraint
  requires the difference. Do not disguise arbitrary measurements as unusual
  numeric utilities or new theme tokens.
- Custom values are exceptions with a concrete benefit: fluid sizing with
  `clamp()` that improves responsive fit, intrinsic asset dimensions (such as
  sprite sheets), exact positioning relationships, or a content-driven
  breakpoint that prevents overflow. Prefer standard utilities and breakpoints
  first. Document a non-obvious constraint near the exception.
- Arbitrary syntax is not itself a problem: references to semantic CSS tokens,
  grid track definitions, and selectors are distinct from arbitrary sizing.
  Reuse existing tokens; introduce new ones only for meaningful shared design
  values, not to avoid square brackets.
- Keep classic CSS for token definitions, custom keyframes, shared base rules,
  and exceptional selectors or coordinated behavior that utilities would make
  substantially harder to understand. Keep exceptions narrowly scoped. Do not
  use `@apply` just to hide utility lists, or extract a component solely because
  its class attribute is long.
- Honor reduced motion, forced colors, and contrast preferences. Enable
  decorative motion with `motion-safe:`, retain immediate feedback without
  motion, let forced colors use the user's palette, and preserve real borders,
  focus outlines, and non-color state cues. Adapt more/less contrast through
  utilities or shared tokens while retaining readable text and controls.
  Avoid `forced-color-adjust: none` for ordinary UI. Do not suppress keyboard
  focus indicators based on pointer type; optional programmatic autofocus can
  be skipped on coarse-pointer devices.
