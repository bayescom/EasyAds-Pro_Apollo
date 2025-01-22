import { Typography } from 'antd';
import { firstTierCity, newFirstTierCity, secondTierCity, thirdTierCity, FourthTierCity, FifthTierCity } from '../Utils/CityLevelTable';
import styles from './index.module.less';

const { Text } = Typography;

export default function CityLevelPartition() {
  return (<div style={{height: '500px', overflow: 'hidden auto'}} className={styles['city-level-partition']}>
    <h3>一线城市({firstTierCity.length})</h3>
    {
      firstTierCity.map((item, index) => <Text key={index} style={{color: '#929292', marginRight: '10px'}}>{item}</Text>)
    }
    <h3>新一线城市({newFirstTierCity.length})</h3>
    {
      newFirstTierCity.map((item, index) => <Text key={index} style={{color: '#929292', marginRight: '10px'}}>{item}</Text>)
    }
    <h3>二线城市({secondTierCity.length})</h3>
    {
      secondTierCity.map((item, index) => <Text key={index} style={{color: '#929292', marginRight: '10px'}}>{item}</Text>)
    }
    <h3>三线城市({thirdTierCity.length})</h3>
    {
      thirdTierCity.map((item, index) => <Text key={index} style={{color: '#929292', marginRight: '10px'}}>{item}</Text>)
    }
    <h3>四线城市({FourthTierCity.length})</h3>
    {
      FourthTierCity.map((item, index) => <Text key={index} style={{color: '#929292', marginRight: '10px'}}>{item}</Text>)
    }
    <h3>五线城市({FifthTierCity.length})</h3>
    {
      FifthTierCity.map((item, index) => <Text key={index} style={{color: '#929292', marginRight: '10px'}}>{item}</Text>)
    }
  </div>);
}
