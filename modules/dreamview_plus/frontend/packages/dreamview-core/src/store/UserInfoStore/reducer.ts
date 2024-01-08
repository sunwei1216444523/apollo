import { produce } from 'immer';
import { CombineAction, IInitState } from './actions';
import { INIT_USER_INFO } from './actionTypes';

export const initState: IInitState = {
    userInfo: {
        avatar_url: '',
        displayname: '',
        id: undefined,
    },
    isLogin: false,
};

export const reducer = (state: IInitState, action: CombineAction) =>
    produce(state, (draftState: IInitState) => {
        switch (action.type) {
            case INIT_USER_INFO:
                draftState.userInfo.avatar_url = action.payload.userInfo.avatar_url;
                draftState.userInfo.displayname = action.payload.userInfo.displayname;
                draftState.userInfo.id = action.payload.userInfo.id;
                draftState.isLogin = action.payload.isLogin;
                draftState.isFirstEnterDreamView = action.payload.isFirstEnterDreamView;
                break;
            default:
                break;
        }
    });
