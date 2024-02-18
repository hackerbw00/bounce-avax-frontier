/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  Button,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  ToastAndroid,
  useColorScheme,
  View,
} from 'react-native';

import * as particleAuth from '@particle-network/rn-auth';
import {AvalancheTestnet} from '@particle-network/chains';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {LoginType, SupportAuthType} from '@particle-network/rn-auth';
import {
  HCESession,
  NFCTagType4NDEFContentType,
  NFCTagType4,
} from 'react-native-hce';
import {ethers} from 'ethers';

particleAuth.ParticleInfo.projectId = '2c500870-5f41-405c-bb30-26b01a5f16b8'; // your project id
particleAuth.ParticleInfo.clientKey =
  'cdudYcV3BfUIrROAc4fvhqk95gspcaN6CaTWgkS5'; // your client key

const chainInfo = AvalancheTestnet;
const env = particleAuth.Env.Production;
particleAuth.init(chainInfo, env);

const type = LoginType.Phone;
const supportAuthType = [SupportAuthType.All];

let session: any;
let listener: any;

function App(): Promise<React.JSX.Element> {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLogin, setIsLogin] = useState(false);
  const [address, setAddress] = useState('');
  const [usdc, setUsdc] = useState('');
  const [usdt, setUsdt] = useState('');

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    (async () => {
      const loggedIn = await particleAuth.isLogin();
      setIsLogin(loggedIn);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (isLogin) {
        const _address = await particleAuth.getAddress();
        setAddress(_address);
        getBalance();
      }
    })();
  }, [isLogin]);

  const startSession = async () => {
    const tag = new NFCTagType4({
      type: NFCTagType4NDEFContentType.Text,
      content:
        '0xff4f55382dc1dad042411e64cf13eafaa051e78c9f343a3ffab8ce2408b74479',
      writable: true,
    });

    session = await HCESession.getInstance();
    session.setApplication(tag);

    await session.setEnabled(true);
    listen();

    ToastAndroid.show('Start Payment', ToastAndroid.LONG);
  };

  const stopSession = async () => {
    ToastAndroid.show('Paid', ToastAndroid.LONG);
    await session.setEnabled(false);
    listener();
  };

  const getBalance = async () => {
    await particleAuth.setChainInfo(AvalancheTestnet);
    const chaininfo = await particleAuth.getChainId();
    console.log(chaininfo);

    const balance = await particleAuth.EvmService.getTokenByTokenAddress(
      '0x8fbD84BB0f621d23A8B5D9CD630dA2CAA793a4D4',
      [
        '0xe0eD866C5796100534da7F98979377e211570F8f',
        '0xF732fa7a9F911517ef9454875928FA41C732af56',
      ],
    );

    const _usdc = ethers.formatEther(balance[0].amount);
    const _usdt = ethers.formatEther(balance[1].amount);
    console.log(usdc, usdt);
    setUsdc(_usdc);
    setUsdt(_usdt);

    console.log(balance);
  };

  const listen = async () => {
    listener = session.on(HCESession.Events.HCE_STATE_READ, () => {
      ToastAndroid.show('The tag has been read! Thank You.', ToastAndroid.LONG);
    });
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            justifyContent: 'center',
            paddingTop: 100,
            paddingHorizontal: 10,
          }}>
          <Image
            source={require('./asset/bounce.png')}
            style={{
              alignSelf: 'center',
            }}
          />

          {isLogin && (
            <>
              <Text>Address: {address}</Text>
              <Text>USDT: {usdt}</Text>
              <Text>USDC: {usdc}</Text>
            </>
          )}

          <View style={{height: 10}} />
          <Button
            title="Login"
            disabled={isLogin}
            onPress={async () => {
              const userInfo = await particleAuth.login(
                type,
                '',
                supportAuthType,
              );
              setIsLogin(true);
              console.log(userInfo);
            }}
          />
          <View style={{height: 10}} />

          <Button title="Pay" disabled={!isLogin} onPress={startSession} />

          <View style={{height: 10}} />

          <Button
            title="Logout"
            disabled={!isLogin}
            onPress={async () => {
              await particleAuth.logout();
              setIsLogin(false);
              setAddress('');
            }}
          />

          <View style={{height: 10}} />

          <Button title="refresh" onPress={getBalance} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;
