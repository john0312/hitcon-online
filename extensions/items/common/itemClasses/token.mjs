// Copyright 2021 HITCON Online Contributors
// SPDX-License-Identifier: BSD-2-Clause

import ItemBase from '../item-base.mjs';

/**
 * Token is used to represent an item that is used as a badge/token.
 * It's usually only tested if it's in the inventory or not.
 */
class Token extends ItemBase {
  /**
   * @param {ExtensionHelper} helper - An extension helper object for servicing
   */
  constructor(helper, imagePath, info, fsm) {
    super(helper, imagePath, info, fsm);

    this.show = true;
    this.exchangeable = false;
    // Usually not usable.
    this.usable = false;
    this.droppable = false;
    // Token doesn't disappear even if you use it.
    this.consumable = false;
  }

  async useItem(playerID, amount) {
    await this.useItemFSM(playerID, amount);
  }
}

export default Token;
