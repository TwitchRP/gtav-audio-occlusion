import AudioDynamixData from './audioDynamixData';

import Interior from './interior';

import { BigVector3 } from '../files/codewalker/vector3';

interface AmbientZone {
  name: string;
  outerPos: Vector3;
  outerSize: Vector3;
  innerPos: Vector3;
  innerSize: Vector3;
  unkHash01: string;
}

export interface InteriorRoom {
  name: string;
  mloRoom: string;
  hash1: string;
  unk02: number;
  unk03: number;
  unk04: number;
  unk05: number;
  unk06: string;
  unk07: number;
  unk08: number;
  unk09: number;
  unk10: number;
  unk11: number;
  unk12: number;
}

export default class AudioGameData {
  private interior: Interior;
  private audioDynamixData: AudioDynamixData;

  public fileName: string;

  public ambientZone: AmbientZone;

  public interiorName: string;
  public interiorRooms: InteriorRoom[];

  constructor(interior: Interior, audioDynamixData: AudioDynamixData) {
    if (interior.isNameHashed) {
      throw new Error(`You can't generate .dat151 files from interiors with hashed names`);
    }

    this.interior = interior;
    this.audioDynamixData = audioDynamixData;

    this.fileName = `${this.interior.name}_game.dat151.rel.xml`;

    this.ambientZone = this.getAmbientZone();

    this.interiorName = this.interior.name;
    this.interiorRooms = this.getInteriorRooms();
  }

  private getAmbientZone(): AmbientZone {
    const min = new BigVector3(this.interior.entitiesExtentsMax);
    const max = new BigVector3(this.interior.entitiesExtentsMin);
    const boxSize = min.minus(max);

    const center = min.plus(boxSize.div(2));

    return {
      name: this.interior.name + '_az',
      outerPos: center.toVector3(),
      outerSize: boxSize.add(1.0).toVector3(),
      innerPos: center.toVector3(),
      innerSize: boxSize.toVector3(),
      unkHash01: this.audioDynamixData.scene.name,
    };
  }

  private getInteriorRooms(): InteriorRoom[] {
    return this.interior.rooms.map(room => ({
      name: room.name,
      mloRoom: room.name,
      hash1: this.ambientZone.name,
      unk02: 0,
      unk03: 0.5,
      unk04: 0,
      unk05: 0,
      unk06: 'null_sound',
      unk07: 0,
      unk08: 0,
      unk09: 0,
      unk10: 0.7,
      unk11: 0,
      unk12: 50,
    }));
  }
}
