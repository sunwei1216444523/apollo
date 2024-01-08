import React, { PropsWithChildren, useEffect, useState } from 'react';
import { Form, Input, IconIcDelete, IconIcAddPanel, IconIcClose, message } from '@dreamview/dreamview-ui';
import { useMakeStyle } from '@dreamview/dreamview-theme';
import { useTranslation } from 'react-i18next';
import { FieldData } from 'rc-field-form/lib/interface';
import tinycolor from 'tinycolor2';
import CustomScroll from '../../CustomScroll';
import BlueButton from './BlueButton';
import ChartLine from './ChartLine';
import { IChartConfig, KEY, IChannelList, initChartValue, initLineValue, IChartListItem } from './const';

function useStyle() {
    const hoc = useMakeStyle((theme) => ({
        bottom14: {
            marginBottom: '14px',
        },
        'chart-editing': {
            height: '80vh',
            background: '#232731',
            width: '372px',
            borderRadius: theme.tokens.border.borderRadius.large,
            '& .dreamview-radio-wrapper': {
                color: '#808B9D',
            },
            '& .dreamview-input-affix-wrapper': {
                background: theme.tokens.colors.background4,
                borderColor: 'transparent',
                overflow: 'visible',
                padding: '0 0 0 11px',
                boxShadow: 'none',
                border: 'none',
            },
            '& .dreamview-input-clear-icon': {
                fontSize: theme.tokens.font.size.large,
                display: 'flex',
                marginRight: theme.tokens.margin.speace,
                width: '16px',
                height: '16px',
                overflow: 'hidden',
                borderRadius: '50%',
                background: 'white',
            },

            '& .anticon-close-circle': {
                width: '20px',
                height: '20px',
                fontSize: '20px',
                marginTop: '-2px',
                marginLeft: '-2px',
                color: '#808B9D',
            },
            '& .dreamview-select input': {
                height: '100% !important',
            },
            '& .dreamview-select-clear': {
                borderRadius: '4px',
            },
            '& .dreamview-select-clear .anticon-close-circle': {
                width: '16px',
                height: '16px',
                fontSize: '16px',
            },
            '& .dreamview-input-affix-wrapper-focused': {
                borderColor: '#4096ff',
            },
            '& .ant-form-item-label': {
                flex: 1,
                '&  > label': {
                    height: '40px',
                    color: theme.tokens.colors.fontColor3,
                    ...theme.tokens.typography.content,
                },
            },
            '& .ant-form-item-control': {
                width: '254px',
                flexGrow: 'unset',
            },
            '& .ant-form-item': {
                marginBottom: theme.tokens.margin.speace2,
            },
            '& .dreamview-input': {
                height: '40px',
            },
            '& .ant-form-item-control-input': {
                height: '40px',
            },
        },
        'chart-new-line': {
            display: 'flex',
            marginTop: '-4px',
        },
        'chart-editing-divider': {
            height: '1px',
            background: theme.tokens.colors.divider2,
            marginBottom: theme.tokens.margin.speace2,
        },
        title: {
            padding: `${theme.tokens.padding.speace} ${theme.tokens.padding.speace3}`,
            ...theme.tokens.typography.title,
            '& .anticon': {
                position: 'absolute',
                right: theme.tokens.margin.speace2,
                top: '12px',
                cursor: 'pointer',
                color: theme.tokens.colors.fontColor2,
            },
        },
        'content-box': {
            padding: `0 ${theme.tokens.padding.speace3}`,
            height: 'calc(80vh - 17px - 42px)',
        },
        'chart-editing-title': {
            height: '20px',
            lineHeight: '20px',
            display: 'flex',
            marginBottom: theme.tokens.margin.speace,
            paddingLeft: theme.tokens.padding.speace,
            position: 'relative',
            color: theme.tokens.colors.fontColor2,
            fontFamily: 'PingFangSC-Medium',
            fontWeight: 500,
            '&::after': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: '4px',
                width: '2px',
                height: '12px',
                backgroundColor: theme.tokens.colors.brand2,
            },
        },
        'chart-editing-extra': {
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
        },
        'chart-delete-btn': {
            ...theme.tokens.typography.content,
            margin: `${theme.tokens.margin.speace3} auto`,
            width: '160px',
            height: '40px',
            lineHeight: '40px',
            textAlign: 'center',
            background: theme.tokens.colors.background4,
            borderRadius: theme.tokens.border.borderRadius.large,
            color: '#F75660',
            cursor: 'pointer',
            '& .anticon': {
                marginRight: '6px',
                fontSize: theme.tokens.font.size.large,
            },
            '&:hover': {
                background: tinycolor(theme.tokens.colors.background4).setAlpha(0.9).toRgbString(),
            },
            '&:active': {
                opacity: 0.8,
            },
        },
    }));

    return hoc();
}

function Divider() {
    const { classes } = useStyle();
    return <div className={classes['chart-editing-divider']} />;
}

function Title(props: PropsWithChildren<{ extra?: React.ReactNode; className?: string }>) {
    const { classes, cx } = useStyle();
    return (
        <div className={cx(classes['chart-editing-title'], props.className)}>
            {props.children}
            <div className={classes['chart-editing-extra']}>{props.extra}</div>
        </div>
    );
}

interface ChartEditingProps {
    onChange: (values: IChartListItem, fields: FieldData[]) => void;
    activeChartConfig: IChartListItem;
    onDeleteChart: (config: IChartListItem) => void;
    onCloseClick: () => void;
    channelList: IChannelList;
}
function ChartEditing(props: ChartEditingProps) {
    const { onChange, activeChartConfig, onDeleteChart, onCloseClick, channelList } = props;
    const { classes } = useStyle();
    const [form] = Form.useForm();
    const { t } = useTranslation('chartEditing');

    const onAddNewLine = () => {
        const prefValue = form.getFieldValue(KEY.lineList);
        if (prefValue.length >= 7) {
            message({
                type: 'error',
                content: t('errorMaxLine'),
            });
            return;
        }
        form.setFieldValue(KEY.lineList, [...form.getFieldValue(KEY.lineList), initLineValue()]);
    };
    const newLineButton = (
        <BlueButton onClick={onAddNewLine} className={classes['chart-new-line']} size='small'>
            <IconIcAddPanel />
            {t('newLine')}
        </BlueButton>
    );
    const onFieldsChange = (changeFields: FieldData[]) => {
        onChange(
            {
                uid: activeChartConfig.uid,
                value: form.getFieldsValue(),
            },
            changeFields,
        );
    };
    const onDeleteClick = () => {
        onDeleteChart(activeChartConfig);
    };

    // activeChartConfig变更时，重置表单数据
    useEffect(() => {
        if (activeChartConfig.uid) {
            form.setFieldsValue(activeChartConfig.value);
        }
    }, [activeChartConfig.uid]);

    return (
        <div className={classes['chart-editing']}>
            <div className={classes.title}>
                {t('chartEditing')}
                <IconIcClose onClick={onCloseClick} />
            </div>
            <Divider />
            <CustomScroll className={classes['content-box']}>
                <Form form={form} onFieldsChange={onFieldsChange} initialValues={initChartValue()}>
                    <Form.Item name={KEY.title} label={t('labelTitle')}>
                        <Input allowClear autoComplete='off' />
                    </Form.Item>
                    <Divider />
                    <Title>{t('XAxis')}</Title>
                    <Form.Item name={KEY.xAxisName} label={t('labelXAxisName')}>
                        <Input autoComplete='off' allowClear />
                    </Form.Item>
                    <Divider />
                    <Title className={classes.bottom14} extra={newLineButton}>
                        {t('YAxis')}
                    </Title>
                    <Form.Item name={KEY.yAxisName} label={t('labelXAxisName')}>
                        <Input autoComplete='off' allowClear />
                    </Form.Item>
                    <Form.List name={KEY.lineList}>
                        {(fields, { add, remove }) =>
                            fields.map((field, index) => (
                                <ChartLine
                                    channelList={channelList}
                                    index={index}
                                    key={form.getFieldValue([KEY.lineList, field.name, 'uid'])}
                                    activeChartConfig={activeChartConfig}
                                    filed={field}
                                    add={add}
                                    remove={remove}
                                />
                                // eslint-disable-next-line prettier/prettier
                            ))}
                    </Form.List>
                </Form>
                <div onClick={onDeleteClick} className={classes['chart-delete-btn']}>
                    <IconIcDelete />
                    {t('deleteChart')}
                </div>
            </CustomScroll>
        </div>
    );
}

export default React.memo(ChartEditing);
