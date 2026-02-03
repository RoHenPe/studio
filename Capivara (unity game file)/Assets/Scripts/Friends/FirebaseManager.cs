// FirebaseManager.cs
using UnityEngine;
using Firebase;
using Firebase.Database;
using Firebase.Extensions;
using System;

public class FirebaseManager : MonoBehaviour
{
    public static FirebaseManager Instance;
    private DatabaseReference dbReference;

    public static event Action<string, int> OnMatchmakingSuccess;

    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
            return;
        }

        FirebaseApp.CheckAndFixDependenciesAsync().ContinueWithOnMainThread(task => {
            if (task.Exception != null)
            {
                Debug.LogError($"Falha ao inicializar o Firebase: {task.Exception}");
                return;
            }
            dbReference = FirebaseDatabase.DefaultInstance.RootReference;
            Debug.Log("Firebase inicializado com sucesso.");
        });
    }

    public void FindOrCreateRoom(string roomId)
    {
        if (dbReference == null) {
            Debug.LogError("Referência do Banco de Dados está nula.");
            return;
        }

        string deviceId = SystemInfo.deviceUniqueIdentifier;
        DatabaseReference roomRef = dbReference.Child("game_rooms").Child(roomId);

        roomRef.RunTransaction(mutableData => {
            if (mutableData.Value == null)
            {
                // Sala não existe, criando...
                mutableData.Child("player1").Value = deviceId;
                mutableData.Child("status").Value = "waiting";
                
                // Seed para sincronização de obstáculos
                int seed = new System.Random().Next();
                mutableData.Child("seed").Value = seed;

                // Initialize player 1 data
                var p1Data = mutableData.Child("player1_data");
                p1Data.Child("posY").Value = 0;
                p1Data.Child("score").Value = 0;
                p1Data.Child("isAlive").Value = true;
                
                return TransactionResult.Success(mutableData);
            }
            else
            {
                // Sala existe, tentando entrar...
                var p1 = mutableData.Child("player1").Value;
                var p2 = mutableData.Child("player2").Value;

                if (p1 != null && p2 != null)
                {
                    // Sala cheia
                    return TransactionResult.Abort(); 
                }
                else if (p1 == null) 
                {
                    // Vaga no player 1
                    mutableData.Child("player1").Value = deviceId;
                     // Initialize player 1 data if needed
                    var p1Data = mutableData.Child("player1_data");
                    if(p1Data.Value == null) {
                        p1Data.Child("posY").Value = 0;
                        p1Data.Child("score").Value = 0;
                        p1Data.Child("isAlive").Value = true;
                    }
                    return TransactionResult.Success(mutableData);
                }
                else if (p2 == null)
                {
                    // Vaga no player 2
                    mutableData.Child("player2").Value = deviceId;
                    mutableData.Child("status").Value = "ready";
                    
                    // Initialize player 2 data
                    var p2Data = mutableData.Child("player2_data");
                    p2Data.Child("posY").Value = 0;
                    p2Data.Child("score").Value = 0;
                    p2Data.Child("isAlive").Value = true;
                    
                    return TransactionResult.Success(mutableData);
                }
            }
            return TransactionResult.Abort();
        }).ContinueWithOnMainThread(task => {
            if (task.Exception != null)
            {
                Debug.LogError($"Erro ao entrar na sala: {task.Exception}");
                OnMatchmakingSuccess?.Invoke(roomId, -1);
            }
            else if (task.IsCompleted)
            {
                DataSnapshot snapshot = task.Result.Snapshot;
                string p1Id = snapshot.Child("player1").Value?.ToString();
                string p2Id = snapshot.Child("player2").Value?.ToString();
                
                // Recupera a seed
                if (snapshot.Child("seed").Exists)
                {
                    GameSession.Seed = int.Parse(snapshot.Child("seed").Value.ToString());
                }

                if (p1Id == deviceId)
                {
                    Debug.Log($"Entrou como Jogador 1 na sala '{roomId}'");
                    
                    // Configura disconnect
                    roomRef.Child("player1").OnDisconnect().RemoveValue();
                    roomRef.Child("player1_data").OnDisconnect().RemoveValue();
                    roomRef.Child("status").OnDisconnect().SetValue("waiting"); 

                    ListenForPlayer2(roomRef, roomId);
                }
                else if (p2Id == deviceId)
                {
                    Debug.Log($"Entrou como Jogador 2 na sala '{roomId}'");

                    // Configura disconnect
                    roomRef.Child("player2").OnDisconnect().RemoveValue();
                    roomRef.Child("player2_data").OnDisconnect().RemoveValue();
                    
                    OnMatchmakingSuccess?.Invoke(roomId, 2);
                }
                else
                {
                     Debug.LogError("Sala cheia ou erro desconhecido.");
                     OnMatchmakingSuccess?.Invoke(roomId, -1);
                }
            }
        });
    }

    private void ListenForPlayer2(DatabaseReference roomRef, string roomId)
    {
        roomRef.Child("status").ValueChanged += HandleStatusChanged;
        void HandleStatusChanged(object sender, ValueChangedEventArgs args)
        {
            if (args.Snapshot != null && args.Snapshot.Value.ToString() == "ready")
            {
                OnMatchmakingSuccess?.Invoke(roomId, 1);
                roomRef.Child("status").ValueChanged -= HandleStatusChanged;
            }
        }
    }

    // --- NOVAS FUNÇÕES DE SINCRONIZAÇÃO ---
    private DatabaseReference GetPlayerRef()
    {
        if (GameSession.RoomId == null) return null;
        string playerNode = GameSession.PlayerNumber == 1 ? "player1_data" : "player2_data";
        return dbReference.Child("game_rooms").Child(GameSession.RoomId).Child(playerNode);
    }
    
    public void UpdatePlayerPosition(float posY)
    {
        GetPlayerRef()?.Child("posY").SetValueAsync(posY);
    }

    public void UpdatePlayerScore(int score)
    {
        GetPlayerRef()?.Child("score").SetValueAsync(score);
    }

    public void UpdatePlayerStatus(bool isAlive)
    {
        GetPlayerRef()?.Child("isAlive").SetValueAsync(isAlive);
    }
}