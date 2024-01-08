import React, { PropsWithChildren, useEffect, useRef, useLayoutEffect } from 'react';
import { Factory } from '../base';
import { MainApi, PluginApi, StreamApi } from '../../services/api';
import { WebSocketManager } from '../../services/WebSocketManager';
import { ConnectionStatusEnum, MetadataItem } from '../../services/WebSocketManager/type';
import { CustomizeEvent, useEventHandlersContext } from '../EventHandlersStore';
import { CustomEventTypes } from '../EventHandlersStore/eventType';
import * as TYPES from './actionTypes';
import { IInitState, initState, reducer } from './reducer';

export const { StoreProvider, useStore } = Factory.createStoreProvider<IInitState, TYPES.CombineAction>({
    initialState: initState,
    reducer,
});

function WebSocketManagerInner(): React.ReactElement {
    const [store, dispatch] = useStore();
    const eventHandlers = useEventHandlersContext();
    const mainConnectionRef = useRef<CustomizeEvent>();
    const pluginConnectionRef = useRef<CustomizeEvent>();

    useLayoutEffect(() => {
        const { customizeSubs } = eventHandlers;
        customizeSubs.reigisterCustomizeEvent(CustomEventTypes.MainConnectedEvent);
        mainConnectionRef.current = customizeSubs.getCustomizeEvent('main:connection');

        customizeSubs.reigisterCustomizeEvent(CustomEventTypes.PluginConnectedEvent);
        pluginConnectionRef.current = customizeSubs.getCustomizeEvent('plugin:connection');

        store?.mainApi?.webSocketManager?.metadata$.subscribe((metadata) => {
            dispatch({ type: TYPES.ACTIONS.UPDATE_METADATA, payload: metadata });
        });
    }, [eventHandlers]);

    useEffect(() => {
        store.mainApi.webSocketManager.connectMain().subscribe((status) => {
            if (status === ConnectionStatusEnum.METADATA) {
                mainConnectionRef.current.publish('main:connection successful');
            }
        });
        store.pluginApi.webSocketManager.connectPlugin().subscribe((status) => {
            if (status === ConnectionStatusEnum.CONNECTED) {
                pluginConnectionRef.current.publish('plugin:connection successful');
            }
        });

        return () => {
            store.mainApi.webSocketManager.disconnect();
            store.pluginApi.webSocketManager.disconnect();
        };
    }, [store.mainApi, store.pluginApi]);

    return null;
}

export function WebSocketManagerProvider(props: PropsWithChildren<{}>): React.ReactElement {
    return (
        <StoreProvider>
            <WebSocketManagerInner />
            {props.children}
        </StoreProvider>
    );
}

export function useMainApi(): MainApi {
    const [store] = useStore();
    return store?.mainApi;
}

export function usePluginApi(): PluginApi {
    const [store] = useStore();
    return store?.pluginApi;
}

export function useStreamApi(): StreamApi {
    const [store] = useStore();
    return store?.streamApi;
}

export function useMetadata(): [MetadataItem[], (metadata: MetadataItem[]) => void] {
    const [store] = useStore();
    return [
        store?.metadata,
        (metadata) => {
            store?.mainApi?.webSocketManager?.setMetadata(metadata);
        },
    ];
}

export function useWebSocketManager(): WebSocketManager {
    const [store] = useStore();
    return store?.mainApi?.webSocketManager;
}
