import { useMakeStyle } from '@dreamview/dreamview-theme';

export default function useStyle() {
    const hoc = useMakeStyle((theme) => ({
        'panel-components': {
            display: 'flex',
            flexDirection: 'column',
            rowGap: '16px',
            justifyContent: 'space-between',
            padding: '16px 16px 20px 24px',
            width: '100%',
            height: '100%',
            overflowX: 'auto',
        },
        'panel-components-list-item': {
            display: 'flex',
            justifyContent: 'space-between',
            height: '32px',
            lineHeight: '32px',
            fontFamily: 'PingFangSC-Regular',
            color: '#A6B5CC',
            fontSize: '14px',
            minWidth: '245px',
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
