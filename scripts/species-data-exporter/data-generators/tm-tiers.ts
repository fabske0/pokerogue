/*
 * SPDX-FileCopyrightText: 2026 Pagefault Games
 * SPDX-FileContributor: Fabske0
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { tmPoolTiers } from "#balance/tm-pool-tiers";
import { ModifierTier } from "#enums/modifier-tier";
import { MoveId } from "#enums/move-id";
import { writeWikiData } from "../helpers";
import type { TmTierWikiEntry } from "../types";

export async function generateTmTiersData(): Promise<void> {
  const entries: TmTierWikiEntry[] = [];

  for (const [move, tier] of Object.entries(tmPoolTiers)) {
    const data: TmTierWikiEntry = {
      move: MoveId[move],
      tier: ModifierTier[tier],
    };
    entries.push(data);
  }

  writeWikiData("tm-tiers", entries);
}
