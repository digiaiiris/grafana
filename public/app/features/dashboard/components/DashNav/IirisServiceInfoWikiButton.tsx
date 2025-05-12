import React from 'react';

// Components
import { ToolbarButton } from '@grafana/ui';

// Types
import { DashboardModel } from '../../state/DashboardModel';

interface Props {
  dashboard: DashboardModel;
  key: string;
}

export default function IirisServiceInfoWikiButton(props: Props) {
  // Callback for clicking wiki icon
  const onOpenWikiPage = () => {
    const { dashboard } = props;
    if (dashboard.serviceInfoWikiUrlIsExternal) {
      // Navigate directly to given URL
      window.open(dashboard.serviceInfoWikiUrl, '_blank');
    } else {
      // Tell parent window to navigate to given URL
      const messageObj = {
        relaytarget: 'wiki',
        relayparams: dashboard.serviceInfoWikiUrl,
      };
      // eslint-disable-next-line
      window.top?.postMessage(messageObj, '*');
    }
  };

  return (
    <ToolbarButton key="open_wiki" tooltip="Go To Wiki" onClick={() => onOpenWikiPage()}>
      <div style={{ width: '20px', height: '20px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 140 140" fill="#ffffff">
          <path d="M86.7,10h-6.3H80H24v120h92V46v-0.3v-6.3L86.7,10z M88,22.7L103.3,38H88V22.7z M108,122H32V18h48v28h28V122z" />
          <rect x="48" y="57" width="45" height="8" />
          <rect x="48" y="75" width="45" height="8" />
          <rect x="48" y="93" width="45" height="8" />
        </svg>
      </div>
    </ToolbarButton>
  );
}
