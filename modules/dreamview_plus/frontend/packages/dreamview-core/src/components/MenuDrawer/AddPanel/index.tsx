import React, { useCallback } from 'react';
import { usePanelCatalogContext } from '@dreamview/dreamview-core/src/store/PanelCatalogStore';
import { useMosaicId, usePanelLayoutStore } from '@dreamview/dreamview-core/src/store/PanelLayoutStore';
import { IPanelMetaInfo } from '@dreamview/dreamview-core/src/components/panels/type/Panel';
import useDragPanel from '@dreamview/dreamview-core/src/util/useDragPanel';
import { IconIcMove, IconReset } from '@dreamview/dreamview-ui';
import { useTranslation } from 'react-i18next';
import { resetLayoutByMode, addPanelFromOutside } from '@dreamview/dreamview-core/src/store/PanelLayoutStore/actions';
import { usePickHmiStore } from '@dreamview/dreamview-core/src/store/HmiStore';
import CustomPopover from '@dreamview/dreamview-core/src/components/CustomPopover';
import CustomScroll from '@dreamview/dreamview-core/src/components/CustomScroll';
import MenuDrawerTitle from '../Common/MenuDrawerTitle';
import useStyle from './useStyle';
import CustomFuncPopoverSpec from '../../CustomFuncPopoverSpec';

function PanelThumbnail(props: { panel: IPanelMetaInfo }) {
    const { classes } = useStyle();

    const { title, description, thumbnail } = props.panel;

    return (
        <div
            className={classes['panel-thumbnail']}
            onClick={(event) => {
                event.stopPropagation();
            }}
        >
            <div className='panel-thumbnail-image' style={{ backgroundImage: `url(${thumbnail})` }} />
            <div className='panel-thumbnail-title'>{title}</div>
            <div className='panel-thumbnail-description'>{description}</div>
        </div>
    );
}

const PanelThumbnailMemo = React.memo(PanelThumbnail);

function DragItem(props: { panel: IPanelMetaInfo }) {
    const mosaicId = useMosaicId();

    const { classes } = useStyle();

    const [, dispatch] = usePanelLayoutStore();
    const [hmi] = usePickHmiStore();

    const [connectDragSource] = useDragPanel(mosaicId, props.panel);

    const handleClickDragItem = () => {
        dispatch(
            addPanelFromOutside({
                mode: hmi.currentMode,
                path: [],
                position: 'left',
                originPanelConfig: props.panel,
            }),
        );
    };

    return (
        <div ref={connectDragSource} onClick={handleClickDragItem}>
            <CustomFuncPopoverSpec title={<PanelThumbnailMemo panel={props.panel} />} trigger='hover' placement='right'>
                <div className={classes['add-panel-item']}>
                    {props.panel.title}
                    <IconIcMove />
                </div>
            </CustomFuncPopoverSpec>
        </div>
    );
}

const DragItemMemo = React.memo(DragItem);

function AddPanel() {
    const { allPanel } = usePanelCatalogContext();
    const [, dispatch] = usePanelLayoutStore();
    const { t } = useTranslation('addPanel');
    const { classes } = useStyle();
    const [hmi] = usePickHmiStore();

    const onResetLayout = useCallback(() => {
        dispatch(resetLayoutByMode({ mode: hmi.currentMode }));
    }, [hmi.currentMode]);

    const extra = (
        <CustomPopover trigger='hover' content={t('resetLayout')}>
            <span>
                <IconReset onClick={onResetLayout} />
            </span>
        </CustomPopover>
    );

    return (
        <>
            <MenuDrawerTitle extra={extra} title={t('addPanel')} />
            <CustomScroll className={classes['add-panel-content']}>
                {allPanel.map((item) => (
                    <DragItemMemo panel={item} key={item.title} />
                ))}
            </CustomScroll>
        </>
    );
}

export default React.memo(AddPanel);
