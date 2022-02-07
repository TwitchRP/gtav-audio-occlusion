import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';

import { PortalEntity } from '../../../../core/classes/audioOcclusion';

import { TableContainer } from './styles';

const PortalsEntities = () => {
  const [portalsEntities, setPortalsEntities] = useState<PortalEntity[][]>();

  const updatePortalsEntities = (
    pRoomPortalIdx: number,
    pEntityIdx: number,
    data: { [key in keyof PortalEntity]?: any },
  ): void => {
    const entityHash = portalsEntities[pRoomPortalIdx][pEntityIdx].entityModelHashkey;

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

    ipcRenderer.send('updatePortalsEntities', updatedPortalsEntities);
  };

  useEffect(() => {
    (async () => {
      const _portalsEntities: PortalEntity[][] = await ipcRenderer.invoke('getPortalsEntities');

      if (_portalsEntities) {
        setPortalsEntities(_portalsEntities);
      }
    })();
  }, []);

  const [hashFormatHex, setHashFormatHex] = useState<boolean>(true);

  const formatHash = (format :boolean, hash_value :number) => { return hash_value ? (
      format ?
        <span className="hash_hex">0x{((hash_value)>>>0).toString(16).toUpperCase()}</span>
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
              <th>Name</th>
              <th>EntityModelHashkey</th>
              <th>IsDoor</th>
              <th>IsGlass</th>
            </tr>
          </thead>
          <tbody>
            {portalsEntities &&
              portalsEntities.map((portalEntities, roomPortalIdx) =>
                portalEntities.map((entity, entityIdx) => (
                  <tr key={entityIdx}>
                    <td>{roomPortalIdx}</td>
                    <td>{entity.linkType}</td>
                    <td>
                      <input
                        type="number"
                        value={entity.maxOcclusion}
                        step={0.1}
                        min={0}
                        max={1}
                        onChange={e =>
                          updatePortalsEntities(roomPortalIdx, entityIdx, {
                            maxOcclusion: parseFloat(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td>{entity.name ? entity.name : null}</td>
                    <td onClick={e => {setHashFormatHex(!hashFormatHex)}}>{formatHash(hashFormatHex, entity.entityModelHashkey)}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={entity.isDoor}
                        onChange={e =>
                          updatePortalsEntities(roomPortalIdx, entityIdx, {
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
                          updatePortalsEntities(roomPortalIdx, entityIdx, {
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

export default PortalsEntities;
