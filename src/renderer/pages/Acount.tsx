import React, { useState, useEffect } from "react";

const Acount = () => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const data = await window.electron.git.account.get();
            setUserData(data);
        };

        fetchUserData();
    }, []);

    // userDataが変更されたときに呼び出される
    useEffect(() => {
        if (userData) {
            // userDataが更新されたときに必要な処理をここに書く
            console.log(userData);
        }
    }, [userData]);

    return (
        <div>
            <h1>IndexPage</h1>
            {userData ? (
                <button
                    onClick={() => {
                        window.electron.git.account.logout();
                    }}
                >
                    ログアウト
                </button>
            ) : (
                <button
                    onClick={() => {
                        window.electron.git.account.open("https://github.com/login/oauth/authorize?client_id=Iv23li81DmrWmEfXtDcS&scope=user,repo");
                    }}
                >
                    ログイン
                </button>
            )}
        </div>
    );
};

export default Acount;