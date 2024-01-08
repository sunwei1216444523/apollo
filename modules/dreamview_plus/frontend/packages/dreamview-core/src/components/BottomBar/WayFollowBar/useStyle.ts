import { useMakeStyle } from '@dreamview/dreamview-theme';

export default function useStyle() {
    const hoc = useMakeStyle((theme) => ({
        'flex-center': {
            display: 'flex',
        },
        disabled: {
            color: '#40454D',
            '& .anticon': {
                color: '#383d47',
                cursor: 'not-allowed',
            },
            '& .progress-pointer': {
                display: 'none',
            },
        },
        'record-controlbar-container': {
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `0 ${theme.tokens.padding.speace3}`,
            color: theme.tokens.colors.fontColor3,
            '& .ic-play-container': {
                // width: '72px',
                height: '40px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            },
        },
    }));

    return hoc();
}
