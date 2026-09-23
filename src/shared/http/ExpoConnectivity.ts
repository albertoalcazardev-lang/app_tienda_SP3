import * as Network from 'expo-network';

import type { Connectivity } from './Connectivity';

export class ExpoConnectivity implements Connectivity {
  async isOnline(): Promise<boolean> {
    const state = await Network.getNetworkStateAsync();

    return state.isConnected !== false && state.isInternetReachable !== false;
  }
}
