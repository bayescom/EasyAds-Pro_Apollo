import styles from '../index.module.less';
import { Image } from 'antd';
import { Link } from 'ice';
import hint from '@/assets/icons/distribution/tips.png';
import step1 from '@/assets/icons/distribution/step_1.png';
import step2 from '@/assets/icons/distribution/step_2.png';
import step3 from '@/assets/icons/distribution/step_3.png';
import success from '@/assets/icons/distribution/success.png';

export default function DefaultTestToolPage() {
  return (<div className={styles['default-test-tool-wrap']}>
    <div className={styles['default-wrap-item-left']}>
      <h1 className={styles['default-wrap-left-title']}>
        <Image src={hint} preview={false}/>
        流量分发，此页面目的为帮助您将流量分发给上游广告网络
      </h1>
      <div className={styles['default-wrap-left-help']}>
        <p className={styles['default-help-secene']}>
          <span className={styles['help-secene-emp']}>在此页面中您可对广告位中的上游广告网络进行:</span>
        </p>
        <p className={styles['default-help-secene']}>
          <Image src={success} preview={false} width={20}/>
          管理参与买量的上游广告网络;
        </p>
        <p className={styles['default-help-secene']}>
          <Image src={success} preview={false} width={20}/>
          调整请求优先级和比例;
        </p>
        <p className={styles['default-help-secene']}>
          <Image src={success} preview={false} width={20}/>
          设置竞价价格、底价、系数;
        </p>
        <p className={styles['default-help-secene']}>
          <Image src={success} preview={false} width={20}/>
          配置频次设置、定向设置;
        </p>
      </div>
    </div>
    <div className={styles['default-wrap-item-right']}>
      <h3>操作步骤</h3>
      <div className={styles['default-wrap-right-step']}>
        <p className={styles['default-right-step-item']}>
          <span className={styles['help-secene-emp']}>Step1：</span>
          导航栏-广告位管理 - <Link to="/traffic/adspot">创建广告位</Link>
          <Image src={step1} preview={false}/>
        </p>
        <p className={styles['default-right-step-item']}>
          <span className={styles['help-secene-emp']}>Step2：</span>
          添加上游买量的广告网络，设置价格、频次、定向等条件
          <Image src={step2} preview={false}/>
          <Image src={step3} preview={false}/>
        </p>
        <p className={styles['default-right-step-item']}>
          <span className={styles['help-secene-emp']}>Step3：</span>
          将流量分配给上游广告网络，调整优先级和流量请求比例.
        </p>
      </div>
    </div>
  </div>);
}
