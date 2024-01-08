import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { ENUM_DOWNLOAD_STATUS, ScenarioSet, ScenarioSetRecord } from '@dreamview/dreamview-core/src/services/api/types';
import useWebSocketServices from '@dreamview/dreamview-core/src/services/hooks/useWebSocketServices';
import { usePickHmiStore } from '@dreamview/dreamview-core/src/store/HmiStore';
import Table from '../Table';
import RenderDownLoadStatus from '../RenderDownLoadStatus';
import RenderName from '../RenderName';
import RenderOperation from '../RenderOperation';
import { useTableHover } from '../useStyle';
import { useDataSource, useScrollHeight } from '../hoc';
import { ENUM_PROFILEMANAGER_TAB } from '../provider';
import Background from '../Background';

type IScenarioSet = ScenarioSet & { frontpercentage: string };

interface IOperations {
    status: ENUM_DOWNLOAD_STATUS;
    id: string;
    recordName: string;
    currentScenarioId: string;
    refreshList: () => void;
    onUpdateDownloadProgress: (r: IScenarioSet) => void;
    onDelete: (r: string) => any;
}

function Operations(props: IOperations) {
    const { onDelete: propOnDelete, status, id, currentScenarioId, onUpdateDownloadProgress, recordName } = props;
    const { isPluginConnected, pluginApi } = useWebSocketServices();
    const usSubScribe = useRef<any>({
        do: () => true,
    });

    const onDelete = useCallback(() => {
        propOnDelete(id);
    }, []);

    const onDownload = useCallback(() => {
        // do download
        if (isPluginConnected) {
            usSubScribe.current.do = pluginApi?.downloadScenarioSet(id, id).subscribe((r) => {
                onUpdateDownloadProgress(r as any);
            });
        }
    }, [isPluginConnected, pluginApi]);

    const onCancelDownload = useCallback(() => false, []);

    useEffect(
        () => () => {
            try {
                usSubScribe.current.do();
            } catch (err) {
                console.log('pluginApi.downloadScenarios usSubScribe failed');
            }
        },
        [],
    );

    return (
        <RenderOperation
            onDelete={onDelete}
            onDownload={onDownload}
            onRefresh={onDownload}
            onCancelDownload={onCancelDownload}
            status={status}
            id={id}
            currentActiveId={currentScenarioId}
        />
    );
}

const OperationsMemo = React.memo(Operations);

const getColumns = (
    t: TFunction<'profileScenarios'>,
    refreshList: () => void,
    updateDownloadProgress: (r: IScenarioSet) => void,
    currentScenarioId: string,
    onDelete: (r: string) => any,
) => [
    {
        title: t('titleName'),
        dataIndex: 'name',
        key: 'name',
        render: (v: string) => <RenderName name={v} />,
    },
    {
        title: t('titleType'),
        dataIndex: 'type',
        width: 250,
        key: 'type',
    },
    {
        title: t('titleState'),
        dataIndex: 'status',
        key: 'status',
        width: 240,
        render: (v: ENUM_DOWNLOAD_STATUS, item: any) => (
            <RenderDownLoadStatus percentage={`${item.percentage}%`} status={v} />
        ),
    },
    {
        title: t('titleOperate'),
        key: 'address',
        width: 200,
        render: (v: any) => (
            <OperationsMemo
                refreshList={refreshList}
                status={v.status}
                id={v.id}
                onDelete={onDelete}
                recordName={v.name}
                onUpdateDownloadProgress={updateDownloadProgress}
                currentScenarioId={currentScenarioId}
            />
        ),
    },
];

const format = (v: any) =>
    Object.entries(v || {})
        .sort(([, a]: any, [, b]: any) => (a.name > b.name ? 1 : -1))
        .map(([key, value]: any) => ({
            percentage: value.percentage,
            status: value.status,
            name: value.name,
            // 暂时写死类型
            type: 'Personal',
            id: key,
        }));

function Scenarios() {
    const { isPluginConnected, pluginApi, isMainConnected, mainApi } = useWebSocketServices();
    const [hmi] = usePickHmiStore();

    const currentScenarioSetId = hmi?.currentScenarioSetId;
    const { t } = useTranslation('profileManagerScenarios');
    const scrollHeight = useScrollHeight();

    const loadScenarios = useCallback(() => {
        if (isMainConnected) {
            mainApi.loadScenarios();
        }
    }, [isMainConnected]);

    const { data, setOriginData, refreshList } = useDataSource<ScenarioSetRecord>({
        apiConnected: isPluginConnected,
        api: () => pluginApi?.getScenarioSetList(),
        format,
        tabKey: ENUM_PROFILEMANAGER_TAB.Scenarios,
    });

    const onDelete = useCallback(
        (type: string) => {
            if (isMainConnected) {
                return mainApi.deleteScenarioSet(type).then(() => {
                    refreshList();
                    loadScenarios();
                });
            }
            return Promise.reject();
        },
        [isMainConnected, loadScenarios],
    );

    const updateDownloadProgress = useCallback(
        (r: IScenarioSet) => {
            setOriginData((prev) => {
                const id = r.resource_id;
                const record = prev[id];
                const percentage = Math.floor(r.percentage);
                if (r.status === 'downloaded') {
                    record.status = ENUM_DOWNLOAD_STATUS.DOWNLOADED;
                    record.percentage = 100;
                    loadScenarios();
                } else {
                    record.status = ENUM_DOWNLOAD_STATUS.DOWNLOADING;
                    record.percentage = percentage;
                }
                return { ...prev };
            });
        },
        [loadScenarios],
    );

    const columns = useMemo(
        () => getColumns(t, refreshList, updateDownloadProgress, currentScenarioSetId, onDelete),
        [t, refreshList, updateDownloadProgress, currentScenarioSetId, onDelete],
    );

    const activeIndex = useMemo(
        () => ({
            activeIndex: data.findIndex((item) => item.id === currentScenarioSetId) + 1,
        }),
        [data, currentScenarioSetId],
    );

    const { classes } = useTableHover()(activeIndex);

    return (
        <Background>
            <Table
                className={classes['table-active']}
                scroll={{
                    y: scrollHeight,
                }}
                rowKey='id'
                columns={columns}
                data={data}
            />
        </Background>
    );
}

export default React.memo(Scenarios);
