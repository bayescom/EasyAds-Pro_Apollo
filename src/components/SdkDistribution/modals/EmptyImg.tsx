import { Empty } from 'antd';
import missingDistritionImage from '@/assets/icons/missingDistritionImage.png';
import styles from './index.module.less';

export default function EmptyImg({ text }: { text: string }) {
  return (<Empty
    image={missingDistritionImage}
    description={<></>}
  >
    <span className={styles['missing-disbriton-img']}>{text}</span>
  </Empty>);
}
