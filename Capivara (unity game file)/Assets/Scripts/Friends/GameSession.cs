using UnityEngine;

public static class GameSession
{
    public static string RoomId { get; set; }
    public static int PlayerNumber { get; set; }
    public static int Seed { get; set; } // Adicionado para sincronização
}