import {
    ipcMain,
    NotificationConstructorOptions,
    Notification,
} from "electron";
import { promisify } from "util";
import childProcess from "child_process";
import Encoding from "encoding-japanese";

/**
 * s-jisをUnicodeに変換する関数
 * @param bytes s-jisの文字列
 * @returns
 */
export const SJIStoUNICODE = (bytes: string) => {
    return Encoding.convert(bytes, {
        from: "SJIS",
        to: "UNICODE",
        type: "string",
    });
};

/**
 * コマンドを実行する関数
 * @param cmd 実行したいコマンド
 * @returns コマンドの実行結果
 */
const cmdFunction = async (cmd: string): Promise<string> => {
    const exec = promisify(childProcess.exec);
    try {
        const result = await exec(cmd, { encoding: "utf8" });
        if (result?.error) {
            const errorstr = SJIStoUNICODE(result.error);
            return errorstr;
        }

        const stdout = SJIStoUNICODE(result.stdout);

        return stdout;
    } catch (err) {
        console.error(err);
        return "コマンドが不正です";
    }
};

const shellFunctionListener = () => {
    // 戻り値のあるものは"handle"でリスナーを立てて、
    // レンダラー側はinvokeを使って
    ipcMain.handle(
        "exec-cmd",
        async (event, [cmd]: string[]) => await cmdFunction(cmd)
    );
};

export default shellFunctionListener;
