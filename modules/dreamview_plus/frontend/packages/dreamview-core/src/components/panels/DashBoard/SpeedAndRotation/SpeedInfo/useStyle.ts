import { useMakeStyle } from '@dreamview/dreamview-theme';

export default function useStyle() {
    const hoc = useMakeStyle((theme) => ({
        'dashboard-speed-info': {
            display: 'flex',
            flex: '1',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#282B36',
            borderRadius: '6px',
            fontFamily: 'PingFangSC-Semibold',
            fontSize: '14px',
            color: '#A6B5CC',
            width: '100%',
            height: '100%',
            paddingBottom: '16px',
        },
        'dashboard-speed-info-font': {
            height: '35px',
            fontFamily: 'DINAlternate-Bold',
            fontSize: '30px',
            color: '#A6B5CC',
            textAlign: 'center',
        },
        'dashboard-speed-info-font-small': {
            height: '18px',
            fontFamily: 'PingFangSC-Regular',
            fontSize: '12px',
            color: '#808B9D',
        },
        'dashboard-speed-brake': {
            display: 'flex',
            justifyContent: 'space-between',
        },
        'dashboard-speed-brake-words': {
            fontFamily: 'PingFangSC-Regular',
            fontSize: '12px',
            color: '#A6B5CC',
        },
        'dashboard-speed-brake-number': {
            fontFamily: 'PingFangSC-Regular',
            fontSize: '12px',
            color: '#808B9D',
        },
        'dashboard-speed-acc': {
            display: 'flex',
            justifyContent: 'space-between',
        },
        'dashboard-speed-acc-words': {
            fontFamily: 'PingFangSC-Regular',
            fontSize: '12px',
            color: '#A6B5CC',
        },
        'dashboard-speed-acc-number': {
            fontFamily: 'PingFangSC-Regular',
            fontSize: '12px',
            color: '#808B9D',
        },
        error: {
            color: theme.tokens.colors.error,
        },
        info: {
            color: theme.tokens.colors.brand2,
        },
        warn: {
            color: theme.tokens.colors.warn,
        },
    }));
    return hoc();
}
