export const PRESENT_DAY_ERA_ID = "present_day";

export const ERAS = [{ id: PRESENT_DAY_ERA_ID, title: "Günümüz", playable: true }];

export const getEraById = (eraId) => ERAS.find((era) => era.id === eraId) || null;
