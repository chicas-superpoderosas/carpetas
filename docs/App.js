import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, TouchableOpacity, Text, View, TextInput, ActivityIndicator, Alert,Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { initializeApp } from '@firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail,onAuthStateChanged, signOut } from '@firebase/auth';
import { LineChart } from 'react-native-chart-kit';

const firebaseConfig = {
    apiKey: "AIzaSyCAG72dU4OMWU658tXsg1BQmRVJhgQ42nA",
    authDomain: "bamx-1a549.firebaseapp.com",
    projectId: "bamx-1a549",
    storageBucket: "bamx-1a549.appspot.com",
    messagingSenderId: "192477903367",
    appId: "1:192477903367:web:c502bbf72858435f9688a2"
};

const app = initializeApp(firebaseConfig);

const AuthScreen = ({ email, setEmail, password, setPassword, isLogin, setIsLogin, handleAuthentication, handlePasswordReset, loading }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>¡Bienvenido!</Text>
            <Text style={styles.subtitulo}>{isLogin ? 'Inicia sesión' : 'Crear cuenta'}</Text>
            <TextInput
                style={[styles.textinput, styles.inputText]}
                value={email}
                onChangeText={setEmail}
                placeholder="ejemplo@gmail.com"
                autoCapitalize="none"
            />
            <TextInput
                style={[styles.textinput, styles.inputText]}
                value={password}
                onChangeText={setPassword}
                placeholder="contraseña"
                secureTextEntry={true}
                autoCapitalize="none"
            />
            <TouchableOpacity onPress={handleAuthentication} style={styles.button} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>{isLogin ? 'Inicia sesión' : 'Crear cuenta'}</Text>
                )}
            </TouchableOpacity>
            <Text style={styles.toggleText} onPress={() => setIsLogin(!isLogin)}>
                {isLogin ? '¿No tienes una cuenta? Crea una' : '¿Ya tienes cuenta? Inicia sesión'}
            </Text>
            {isLogin && (
                <Text style={styles.toggleText} onPress={handlePasswordReset}>
                    ¿Olvidaste tu contraseña?
                </Text>
            )}
            <StatusBar style="auto" />
        </View>
    );
}
const AuthenticatedScreen = ({ user, handleSignOut }) => {
    const screenWidth = Dimensions.get('window').width;
    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // color rosado para la línea
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // color de las etiquetas
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#ff6384',
        },
    };

    const data = {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [
            {
                data: [14, 16, 19, 26, 27, 31, 34, 34, 31, 25, 18, 13],
                strokeWidth: 2,
            },
        ],
    };

    return (
        <View style={styles.authContainer}>
            <Text style={styles.titulo}>¡Bienvenido!</Text>
            <Text style={styles.textinput}>{user.email}</Text>
            <TouchableOpacity onPress={handleSignOut} style={styles.button}>
                <Text style={styles.buttonText}>Cerrar sesión</Text>
            </TouchableOpacity>
            <View style={styles.containerG}>
                <Text style={styles.subsubtitulo}>Temperatura media mensual en Hermosillo</Text>
                <LineChart
                    data={data}
                    width={screenWidth}
                    yAxisLabel={'°C '}
                    height={400}
                    chartConfig={chartConfig}
                    style={styles.chart}
                />
            </View>
        </View>
    );
};

const Stack = createStackNavigator();

export default App = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState(null);
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const auth = getAuth(app);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, [auth]);

    const handleAuthentication = async () => {
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = () => {
        if (!email) {
            Alert.alert('Error', 'Por favor, ingrese su correo electrónico.');
            return;
        }
        sendPasswordResetEmail(auth, email)
            .then(() => {
                Alert.alert('Correo enviado', 'Se ha enviado un correo para restablecer la contraseña.');
            })
            .catch((error) => {
                setError(error.message);
            });
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        if (error) {
            Alert.alert('Error', error);
        }
    }, [error]);

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    ...TransitionPresets.DefaultTransition,
                    headerShown: false
                }}
            >
                {user ? (
                    <Stack.Screen name="AuthenticatedScreen">
                        {props => <AuthenticatedScreen {...props} user={user} handleSignOut={handleSignOut} />}
                    </Stack.Screen>
                ) : (
                    <Stack.Screen name="AuthScreen">
                        {props => (
                            <AuthScreen
                                {...props}
                                email={email}
                                setEmail={setEmail}
                                password={password}
                                setPassword={setPassword}
                                isLogin={isLogin}
                                setIsLogin={setIsLogin}
                                handleAuthentication={handleAuthentication}
                                handlePasswordReset={handlePasswordReset}
                                loading={loading}
                            />
                        )}
                    </Stack.Screen>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f1f1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    titulo: {
        fontSize: 50,
        fontWeight: 'bold',
    },
    subsubtitulo: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    subtitulo: {
        fontSize: 20,
        color: 'blue',
    },
    textinput: {
        backgroundColor: '#fff',
        padding: 10,
        paddingStart: 30,
        width: '80%',
        height: 50,
        marginTop: 20,
        borderRadius: 30,
    },
    inputText: {
        fontSize: 16,
    },
    button: {
        backgroundColor: '#2a224a',
        padding: 10,
        paddingStart: 30,
        paddingEnd: 30,
        width: '80%',
        height: 50,
        marginTop: 30,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    toggleText: {
        color: '#2a224a',
        marginTop: 20,
        textDecorationLine: 'underline',
        cursor: 'pointer',
    },
    authContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    containerG: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        backgroundColor: '#f1f1f1',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
});

