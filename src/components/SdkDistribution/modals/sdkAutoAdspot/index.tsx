import CsjSdkAutoAdspot from './CsjSdkAutoAdspot';
import YlhSdkAutoAdspot from './YlhSdkAutoAdspot';
import BdSdkAutoAdspot from './BdSdkAutoAdspot';
import KsSdkAutoAdspot from './KsSdkAutoAdspot';

type Iprops = {
  channelId: number,
  drawerFormVisible,
  adspotType: number,
  metaAppId: string,
  reportApiName: string,
  channelAlias: string | undefined,
  thirdModalData?: Record<string, any> | null,
  isEditThird: boolean,
  isEditAdspotChannel: boolean,
  isHeadBidding: number,
  onClose: (isSubmit?: boolean) => void
}

export default function SdkAutoAdspot({
  channelId,
  drawerFormVisible,
  adspotType,
  metaAppId,
  reportApiName,
  channelAlias,
  thirdModalData,
  isEditThird,
  isEditAdspotChannel,
  isHeadBidding,
  onClose
}: Iprops) {

  return (<>
    {channelId == 3 && <CsjSdkAutoAdspot
      drawerFormVisible={drawerFormVisible}
      adspotType={adspotType}
      metaAppId={metaAppId}
      reportApiName={reportApiName}
      channelAlias={channelAlias}
      thirdModalData={thirdModalData}
      isEditThird={isEditThird}
      isEditAdspotChannel={isEditAdspotChannel}
      isHeadBidding={isHeadBidding}
      onClose={(isSubmit) => onClose(isSubmit)}
    />}

    {
      channelId == 2 && <YlhSdkAutoAdspot
        drawerFormVisible={drawerFormVisible}
        adspotType={adspotType}
        metaAppId={metaAppId}
        reportApiName={reportApiName}
        channelAlias={channelAlias}
        thirdModalData={thirdModalData}
        isEditThird={isEditThird}
        isEditAdspotChannel={isEditAdspotChannel}
        isHeadBidding={isHeadBidding}
        onClose={(isSubmit) => onClose(isSubmit)}
      />}
      
    {channelId == 4 && <BdSdkAutoAdspot
      drawerFormVisible={drawerFormVisible}
      adspotType={adspotType}
      metaAppId={metaAppId}
      reportApiName={reportApiName}
      channelAlias={channelAlias}
      thirdModalData={thirdModalData}
      isEditThird={isEditThird}
      isEditAdspotChannel={isEditAdspotChannel}
      isHeadBidding={isHeadBidding}
      onClose={(isSubmit) => onClose(isSubmit)}
    />}

    {channelId == 5 && <KsSdkAutoAdspot
      drawerFormVisible={drawerFormVisible}
      adspotType={adspotType}
      metaAppId={metaAppId}
      reportApiName={reportApiName}
      channelAlias={channelAlias}
      thirdModalData={thirdModalData}
      isEditThird={isEditThird}
      isEditAdspotChannel={isEditAdspotChannel}
      isHeadBidding={isHeadBidding}
      onClose={(isSubmit) => onClose(isSubmit)}
    />}
  </>);
}
