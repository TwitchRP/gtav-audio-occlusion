import { joaat, isBitSet } from '../../utils';

import Interior from '../interior';

import Node from './node';
import PathNodeItem from './pathNodeitem';
import Path from './path';

export interface PortalEntity {
  linkType: number;
  maxOcclusion: number;
  entityModelHashkey: number;
  entityModel: string;
  isDoor: boolean;
  isGlass: boolean;
}

export interface PortalInfo {
  index: number;
  infoIdx: number;
  interiorProxyHash: number;
  portalIdx: number;
  roomIdx: number;
  destInteriorHash: number;
  destRoomIdx: number;
  portalEntityList: PortalEntity[];
}

export interface PathNodeDirection {
  portal: number;
  from: number;
  to: number;
}

export default class AudioOcclusion {
  private interior: Interior;

  public occlusionHash: number;

  public fileName: string;

  public portalsEntities: PortalEntity[][];
  public portalInfoList: PortalInfo[];
  public nodes: Node[];

  public pathNodeList: PathNodeItem[];

  constructor(interior: Interior) {
    this.interior = interior;

    this.occlusionHash = this.getOcclusionHash();

    this.fileName =
      this.occlusionHash > 0 ? `${this.occlusionHash}.ymt.pso.xml` : `${this.occlusionHash >>> 0}.ymt.pso.xml`;

    this.portalsEntities = this.getPortalsEntities();
    this.portalInfoList = this.getPortalInfoList();

    this.nodes = Node.getNodes(this.portalInfoList, this.interior, this.occlusionHash);
  }

  private getOcclusionHash(): number {
    const pos = this.interior.position;

    let archetypeNameHash: number;

    if (this.interior.cMapData.archetypeName.startsWith('hash_')) {
      const [, hexString] = this.interior.cMapData.archetypeName.split('_');

      archetypeNameHash = parseInt(hexString, 16);
    } else {
      archetypeNameHash = joaat(this.interior.name, true);
    }

    return archetypeNameHash ^ (pos.x * 100) ^ (pos.y * 100) ^ (pos.z * 100);
  }

  private getPortalsEntities(): PortalEntity[][] {
    return this.interior.portals.map((portal, idx) => {
      if (portal.attachedObjects.length > 0) {
        let portalEntities = portal.attachedObjects.map(attachedObject => {
          let maxOcclusion = 0.0;

          if (attachedObject.isDoor) {
            maxOcclusion = 0.7;
          }

          if (attachedObject.isGlass) {
            maxOcclusion = 0.4;
          }

          return {
            linkType: 1,
            maxOcclusion,
            entityModelHashkey: attachedObject.hash,
            entityModel: attachedObject.name,
            isDoor: attachedObject.isDoor,
            isGlass: attachedObject.isGlass,
          };
        })

        if (portalEntities.some(e=>e.isDoor)) // if there are doors, there should be no windows?
        {
          return portalEntities.filter(e=>e.isDoor);
        }
        return portalEntities
      }
      else
      {
        return [/*{
          linkType: 9,
          maxOcclusion: 0.0,
          entityModelHashkey: null,
          entityModel: null,
          isDoor: false,
          isGlass: false,
        }*/];
      }
    });
  }

  private getPortalInfoList(): PortalInfo[] {
    let portalInfoList: PortalInfo[] = [];

    this.interior.rooms.forEach(room => {
      const roomPortals = this.interior.getRoomPortals(room.index);

      roomPortals.sort((a, b) => {
        return a.index - b.index;
      });

      // PortalIdx is relative to RoomIdx
      const roomPortalInfoList = roomPortals
        .filter(portal => !isBitSet(portal.flags, 1) && !isBitSet(portal.flags, 2))
        .map((portal, index) => {
          let portalEntityList = this.portalsEntities[portal.index];
          if (this.portalsEntities[portal.index].some(e=>e.isDoor)) // if there are doors, there should be no windows?
          {
            portalEntityList = this.portalsEntities[portal.index].filter(e=>e.isDoor);
          }

          const portalInfo = {
            index: portal.index,
            infoIdx: 0,
            interiorProxyHash: this.occlusionHash,
            portalIdx: index,
            roomIdx: portal.from,
            destInteriorHash: this.occlusionHash,
            destRoomIdx: portal.to,
            portalEntityList: portalEntityList,
          };

          return portalInfo;
        });

      portalInfoList = [...portalInfoList, ...roomPortalInfoList];
    });

    portalInfoList.forEach((portalInfo, index) => {
      portalInfo.infoIdx = index;
    });

    return portalInfoList;
  }

  public beforeEncode(): void {
    this.pathNodeList = Path.getPaths(this.nodes);
  }
}
