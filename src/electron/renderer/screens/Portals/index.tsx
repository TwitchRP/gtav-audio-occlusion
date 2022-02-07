import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';

import AudioOcclusion, { PortalEntity } from '../../../../core/classes/audioOcclusion';

import { TableContainer } from './styles';

const Portals = () => {
  const [portalsEntities, setPortalsEntities] = useState<PortalEntity[][]>();

  const updatePortalsEntities = (
    pPortalIdx: number,
    pEntityIdx: number,
    data: { [key in keyof PortalEntity]?: any },
  ): void => {
    const entityHash = portalsEntities[pPortalIdx][pEntityIdx].entityModelHashkey;

    if (data.maxOcclusion && isNaN(data.maxOcclusion)) {
      data.maxOcclusion = 0.0;
    }

    const updatedPortalsEntities = portalsEntities.map(portal => {
      return portal.map(entity => {
        if (entityHash !== entity.entityModelHashkey) return entity;

        return {
          ...entity,
          ...data,
        };
      });
    });

    setPortalsEntities(updatedPortalsEntities);

    ipcRenderer.send('updatePortalEntity', data);
  };

  useEffect(() => {
    (async () => {
      const audioOcclusion: AudioOcclusion = await ipcRenderer.invoke('getAudioOcclusion');

      if (audioOcclusion) {
        setPortalsEntities(audioOcclusion.portalsEntities);
      }
    })();
  }, []);

  const [hashFormatHex, setHashFormatHex] = useState<boolean>(true);

  const formatHash = (format :boolean, hash_value :number) => { return hash_value ? (
      format ?
        <span className="hash_hex">0x{((hash_value)>>>0).toString(16)}</span>
      :
        <span className="hash_dec">{hash_value.toString(10)}</span>
      ):<span></span>
  }

  return (
    <>
      <h1>Portals Entities</h1>
      <TableContainer>
        <table>
          <thead>
            <tr>
              <th>Portal Index</th>
              <th>LinkType</th>
              <th>MaxOcclusion</th>
              <th>EntityModel</th>
              <th>EntityModelHashkey</th>
              <th>IsDoor</th>
              <th>IsGlass</th>
            </tr>
          </thead>
          <tbody>
            {portalsEntities &&
              portalsEntities.map((portalEntities, portalIdx) =>
                portalEntities.map((entity, entityIdx) => (
                  <tr key={entityIdx}>
                    <td>{portalIdx}</td>
                    <td>{entity.linkType}</td>
                    <td>
                      <input
                        type="number"
                        value={entity.maxOcclusion}
                        step={0.1}
                        min={0}
                        max={1}
                        onChange={e =>
                          updatePortalsEntities(portalIdx, entityIdx, {
                            maxOcclusion: parseFloat(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td>{entity.entityModel?entity.entityModel.startsWith("hash_")?"":entity.entityModel:""}</td>
                    <td onClick={e => {setHashFormatHex(!hashFormatHex)}}>{formatHash(hashFormatHex, entity.entityModelHashkey)}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={entity.isDoor}
                        onChange={e =>
                          updatePortalsEntities(portalIdx, entityIdx, {
                            isDoor: e.target.checked,
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={entity.isGlass}
                        onChange={e =>
                          updatePortalsEntities(portalIdx, entityIdx, {
                            isGlass: e.target.checked,
                          })
                        }
                      />
                    </td>
                  </tr>
                )),
              )}
          </tbody>
        </table>
      </TableContainer>
    </>
  );
};

export default Portals;
