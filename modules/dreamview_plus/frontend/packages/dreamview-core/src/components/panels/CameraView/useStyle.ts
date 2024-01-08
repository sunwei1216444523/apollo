import { useMakeStyle } from '@dreamview/dreamview-theme';

export default function useStyle() {
    const hoc = useMakeStyle((theme) => ({
        'panel-camera-root': {
            position: 'relative',
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        'camera-btn-container': {
            position: 'absolute',
            bottom: '24px',
            right: '24px',
        },
        'camera-btn-item': {
            display: 'inline-block',
            cursor: 'pointer',
            textAlign: 'center',
            width: '32px',
            height: '32px',
            lineHeight: '32px',
            background: '#343C4D',
            borderRadius: '6px',
            marginTop: '12px',
            fontSize: '16px',
        },
        'camera-canvas-container': {
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        'panel-camera-canvas': {},
        'layer-menu-container': {
            width: '158px',
            height: '94px',
        },
        'layer-menu-header': {
            height: '40px',
            paddingLeft: '24px',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #383B45',
            fontFamily: 'PingFangSC-Medium',
            fontSize: '16px',
            color: '#FFFFFF',
            fontWeight: '500',
        },
        'layer-menu-content-right': {
            height: '54px',
            paddingLeft: '24px',
            display: 'flex',
            alignItems: 'center',
            fontFamily: 'PingFangSC-Regular',
            fontSize: '14px',
            color: '#A6B5CC',
            fontWeight: '400',
        },
    }));
    return hoc();
}
