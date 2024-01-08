import { produce } from 'immer';
import * as TYPES from './actionTypes';
import { MainApi, PluginApi, StreamApi } from '../../services/api';
import { webSocketManager, WebSocketManager } from '../../services/WebSocketManager';
import { MetadataItem } from '../../services/WebSocketManager/type';

export interface IInitState {
    metadata: MetadataItem[];
    mainApi: MainApi;
    pluginApi: PluginApi;
    streamApi: StreamApi;
    webSocketManager: WebSocketManager;
}

export const initState: IInitState = {
    metadata: [],
    mainApi: new MainApi(),
    pluginApi: new PluginApi(),
    streamApi: new StreamApi(),
    webSocketManager,
};

export const reducer = (state: IInitState, action: TYPES.CombineAction) =>
    produce(state, (draftState: IInitState) => {
        switch (action.type) {
            case TYPES.ACTIONS.UPDATE_METADATA:
                draftState.metadata = action.payload;
                break;
            default:
                break;
        }
    });
