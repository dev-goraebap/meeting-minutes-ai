/** Replaces "Speaker A" (etc.) with the mapped name, if one exists. */
export function applySpeakerMappingToText(
  text: string,
  mapping: Record<string, string> | null,
) {
  if (!mapping) return text;
  return text.replace(/Speaker ([A-Z])/g, (match, label: string) =>
    mapping[label] ? mapping[label] : match,
  );
}

/** Resolves a single speaker label ("A") to its mapped name, or the label itself. */
export function resolveSpeakerName(
  label: string,
  mapping: Record<string, string> | null,
) {
  return mapping?.[label] || label;
}

export function distinctSpeakerLabels(
  segments: { speaker: string }[] | null,
) {
  return Array.from(new Set((segments ?? []).map((s) => s.speaker))).sort();
}
