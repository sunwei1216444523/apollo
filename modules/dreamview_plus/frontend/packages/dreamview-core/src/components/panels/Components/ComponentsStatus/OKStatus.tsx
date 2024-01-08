import { IconIcSucceed } from '@dreamview/dreamview-ui';
import React from 'react';
import useStyle from './useStyle';

export function OKStatus() {
    const { classes } = useStyle();

    return (
        <div className={classes['status-ok']}>
            <IconIcSucceed
                style={{
                    fontSize: '16px',
                    marginRight: '6px',
                }}
            />
            OK
        </div>
    );
}
