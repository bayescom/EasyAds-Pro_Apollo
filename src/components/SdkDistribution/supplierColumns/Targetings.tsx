import { ISdkAdspotChannel } from '@/models/types/sdkAdspotChannel';
import { Tooltip, Divider, Typography } from 'antd';
import { useMemo } from 'react';
import FieldType from '../types/fieldType';
import styles from './index.module.less';
import { formatModalDataFromPayload } from '@/components/SdkDistribution/utils/formatSdkAdspotChannel';
import { Fragment } from 'react';

const { Text } = Typography;

function Targetings({ model }: { model: ISdkAdspotChannel}) {
  const newModel = formatModalDataFromPayload(model);
  const fields = useMemo(() => {
    const allFields: FieldType[] = [
      { valuePath: 'deviceMaker', label: '制造商' },
      { valuePath: 'excludeDeviceMaker', label: '制造商排除' },
      { valuePath: 'osv', label: '操作系统版本' },
      { valuePath: 'excludeOsv', label: '操作系统版本排除' },
      { valuePath: 'location', label: '地域' },
      { valuePath: 'excludeLocation', label: '地域排除' },
      { valuePath: 'appVersion', label: 'APP版本' },
    ];

    allFields.forEach(item => {
      const fieldValue = newModel[item.valuePath];
      if (fieldValue) {
       
        item.value = fieldValue.split(',');
        return;
      }

      item.value = fieldValue;
    });
    return allFields.filter(item => item.value);
  }, [newModel]);

  return (<>
    {
      fields.length
        ? (fields.map((item, index) => (<Fragment key={item.valuePath}>
          {
            index
              ? <Divider
                type="vertical"
                style={{ border: '1px solid #ccc' }}
              />
              : ''
          }
          <Tooltip title={item.label + ':' + item.value}>
            <Text className={styles['ad-info']}>{item.label}</Text>
          </Tooltip>
        </Fragment>))
        ): (<>-</>)
    }
  </>);
}

export default Targetings;
