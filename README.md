# Proyecto de inicio de sesión en React Native

Este proyecto es una aplicación de inicio de sesión en React Native que utiliza Firebase para la autenticación. Incluye funcionalidades para crear una cuenta, iniciar sesión, restablecer la contraseña y cerrar sesión. Al iniciar sesión, muestra un gráfico sobre le temperatura media mensual en la ciudad de Hermosillo, Sonora. 

## Estructura del proyecto

### 'App.js'

Este archivo contiene el código principal de la aplicación. Define las pantallas de autenticación y de usuario autenticado, maneja la lógica de autenticación y configura la navegación entre pantallas.

#### Importaciones

Las importaciones necesarias para la aplicación, incluyendo React, componentes de React Native, navegación, Firebase y el componente del gráfico.

```javascript
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, TouchableOpacity, Text, View, TextInput, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { initializeApp } from '@firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signOut } from '@firebase/auth';
import { LineChart } from 'react-native-chart-kit';
```

### Configuración de Firebase

Se configura la aplicación de Firebase con las credenciales del proyecto.

```
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
```

### Pantalla de autenticación (AuthScreen)

Define la pantalla de autenticación con campos para correo electrónico y contraseña, y botones para iniciar sesión, crear cuenta y restablecer contraseña.
```
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
```

### Pantalla autenticada (AuthenticatedScreen)

Define la pantalla que se muestra cuando el usuario ha iniciado sesión

```
const AuthenticatedScreen = ({ user, handleSignOut }) => {  
    return (
      <View style={styles.authContainer}>
        <Text style={styles.titulo}>Bienvenido</Text>
        <Text style={styles.textinput}>{user.email}</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.button}>
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </TouchableOpacity>
        </View>
    );
};
```

### Componente principal (App)

El componente principal maneja el estado de autenticación, configura la navegación y renderiza las pantallas correspondientes.
```
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
```

### Styles.js

Este componente contiene los estilos utilizados en la aplicación.

```
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
```

### Qué necesitas

- Para este programa, necesitas Node.js para la compilación, en adición, es necesario tener instalado JavaScript en tu equipo.
- En cuanto a las librerías, es necesario instalar react native chart kit y react navigation native.
- Para la base de datos, es necesario haber instalado Firebase. 


### Contribución

1. Haz un fork del proyecto.
2. Crea una rama para tu nueva funcionalidad (git checkout -b feature/nueva-funcionalidad).
3. Realiza tus cambios y haz un commit (git commit -am 'Añade nueva funcionalidad').
4. Sube los cambios a tu rama (git push origin feature/nueva-funcionalidad).
5. Crea un nuevo Pull Request.

