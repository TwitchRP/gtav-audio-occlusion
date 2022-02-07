import { convertToInt32, joaat, isCMloArchetypeDef, isBitSet } from '../../utils';

import * as XML from '../../types/xml';

export class CMloArchetypeDef {
  public entities: XML.MloEntity[];
  public rooms: XML.MloRoom[];
  public portals: XML.MloPortal[];
  public fileName: string;

  constructor(rawData: XML.Ytyp, fileName: string) {
    let rawArchetype: XML.CMloArchetypeDef;

    const archetypesItem = rawData.CMapTypes.archetypes.Item;

    if (Array.isArray(archetypesItem)) {
      rawArchetype = archetypesItem.find(isCMloArchetypeDef);
    } else {
      if (isCMloArchetypeDef(archetypesItem)) {
        rawArchetype = archetypesItem;
      } else {
        throw new Error('No CMloArchetypeDef found in the .ytyp file');
      }
    }

    this.entities = this.getEntities(rawArchetype);
    this.rooms = this.getRooms(rawArchetype);
    this.portals = this.getPortals(rawArchetype);

    this.fileName = fileName;
  }

  private getEntities(archetype: XML.CMloArchetypeDef): XML.MloEntity[] {
    console.log('CMloArchetypeDef: getting entities ...');

    return archetype.entities.Item.map(rawMloEntity => {
      let hash: number;

      if (rawMloEntity.archetypeName.startsWith('hash_')) {
        const [, hexString] = rawMloEntity.archetypeName.split('_');

        hash = parseInt(hexString, 16);
      } else {
        hash = joaat(rawMloEntity.archetypeName);
      }

      const isDoor = !isBitSet(parseInt(rawMloEntity.flags.$.value), 5) && isBitSet(parseInt(rawMloEntity.flags.$.value), 19) && isBitSet(parseInt(rawMloEntity.flags.$.value), 20);
      const isGlass = isBitSet(parseInt(rawMloEntity.flags.$.value), 5) && isBitSet(parseInt(rawMloEntity.flags.$.value), 19) && isBitSet(parseInt(rawMloEntity.flags.$.value), 20);

      return {
        hash: convertToInt32(hash),
        name: rawMloEntity.archetypeName,
        isDoor,
        isGlass,
      };
    });
  }

  private getRooms(archetype: XML.CMloArchetypeDef): XML.MloRoom[] {
    console.log('CMloArchetypeDef: getting rooms ...');

    return archetype.rooms.Item.map((rawMloRoom, index) => {
      const name = rawMloRoom.name;

      const portalCount = parseInt(rawMloRoom.portalCount.$.value);

      return {
        index,
        name,
        portalCount,
      };
    });
  }

  private getPortals(archetype: XML.CMloArchetypeDef): XML.MloPortal[] {
    console.log('CMloArchetypeDef: getting portals ...');

    const portals = Array.isArray(archetype.portals.Item) ? archetype.portals.Item : [archetype.portals.Item];

    return portals.map((rawMloPortal, index) => {
      const from = parseInt(rawMloPortal.roomFrom.$.value);

      const to = parseInt(rawMloPortal.roomTo.$.value);

      const attachedObjects = rawMloPortal.attachedObjects
        .split(' ')
        .filter(entity => !!entity)
        .map(entityIdx => {
          const parsedEntityIdx = parseInt(entityIdx);

          return this.entities[parsedEntityIdx];
        });

      const flags = parseInt(rawMloPortal.flags.$.value);

      return {
        index,
        from,
        to,
        attachedObjects,
        flags,
      };
    });
  }
}
