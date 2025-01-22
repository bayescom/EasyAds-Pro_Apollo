import { Form, Checkbox } from 'antd';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';
import { initColumnsList } from '@/components/Utils/TableColumnCostomization';

type CheckOptions = {
  label: string,
  value: string,
  disabled?: boolean,
};

const { Group } = Checkbox;

interface IProps {
  defaultValuesList: string [],
  checkedList: string [],
  labelName: string,
  isTimeStampDisabled?: boolean,
  changeCheckedValues: (value: CheckboxValueType[]) => void,
}

const DataDimension: React.FC<IProps> = ({ defaultValuesList, checkedList, labelName, changeCheckedValues, isTimeStampDisabled } : IProps) => {
  const checkboxList: CheckOptions[] = checkedList.map(item => ({
    label: initColumnsList[item].title as string,
    value: initColumnsList[item].key as string,
    disabled: initColumnsList[item].key == 'timestamp' && isTimeStampDisabled
  }));

  const changeCheckedValue = (value: CheckboxValueType[]) => {
    changeCheckedValues(value);
  };

  return (
    <Form
      initialValues={{
        dimensions: defaultValuesList
      }}
    >
      <Form.Item label={labelName} name="dimensions">
        <Group onChange={changeCheckedValue}>
          {
            checkboxList.map(item => (
              <Checkbox value={item.value} key={item.value} disabled={item.disabled} defaultChecked={true}>{item.label}</Checkbox>
            ))
          }
        </Group>
      </Form.Item>
    </Form>
  );
};

export default DataDimension;
