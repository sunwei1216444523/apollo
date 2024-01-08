import { useMakeStyle } from '@dreamview/dreamview-theme';

export default function useStyle() {
    const hoc = useMakeStyle((theme) => ({
        'panel-module-delay-root': {
            padding: theme.tokens.padding.speace2,
            height: '100%',
            width: '100%',
        },
        'panel-module-delay-scroll': {
            minWidth: '244px',
        },
        'panel-module-delay-item': {
            display: 'flex',
            ...theme.tokens.typography.content,
            color: theme.tokens.font.color.main,
            marginBottom: '10px',
            '&:last-of-type': {
                marginBottom: 0,
            },
        },
        name: {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: 1,
            marginRight: theme.tokens.margin.speace,
        },
        time: {
            whiteSpace: 'nowrap',
        },
        error: {
            color: theme.tokens.font.color.error,
        },
    }));
    return hoc();
}
