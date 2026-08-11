import type { Section } from "@/components/ProjectPage";
import type { Locale, Slug } from "../routes";

import * as frEclosion from "./fr/eclosion";
import * as frDatasentinel from "./fr/datasentinel";
import * as frSupkonquest from "./fr/supkonquest";
import * as frLudoria from "./fr/ludoria";
import * as frLayingGrass from "./fr/laying-grass";
import * as frGamedex from "./fr/gamedex";

import * as enEclosion from "./en/eclosion";
import * as enDatasentinel from "./en/datasentinel";
import * as enSupkonquest from "./en/supkonquest";
import * as enLudoria from "./en/ludoria";
import * as enLayingGrass from "./en/laying-grass";
import * as enGamedex from "./en/gamedex";

// Le registre des corps de fiche.
//
// Le type `Record<Locale, Record<Slug, ...>>` est le garde-fou : ajouter un
// septieme travail a SLUGS sans ecrire ses deux fichiers de prose devient une
// erreur de compilation, dans les deux langues a la fois. C'est ce que deux
// arbres HTML tenus a la main ne pouvaient pas garantir.

export const prose: Readonly<
  Record<Locale, Readonly<Record<Slug, readonly Section[]>>>
> = {
  fr: {
    eclosion: frEclosion.sections,
    datasentinel: frDatasentinel.sections,
    supkonquest: frSupkonquest.sections,
    ludoria: frLudoria.sections,
    "laying-grass": frLayingGrass.sections,
    gamedex: frGamedex.sections,
  },
  en: {
    eclosion: enEclosion.sections,
    datasentinel: enDatasentinel.sections,
    supkonquest: enSupkonquest.sections,
    ludoria: enLudoria.sections,
    "laying-grass": enLayingGrass.sections,
    gamedex: enGamedex.sections,
  },
} as const;
