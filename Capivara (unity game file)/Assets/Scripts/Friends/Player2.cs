// Player2.cs
using UnityEngine;

public class Player2 : MonoBehaviour
{
    // ... (suas variáveis [SerializeField] continuam aqui)
    [SerializeField] private Vector3 axis;
    [SerializeField] private float gravity = -9f;
    [SerializeField] private float force = 5f;
    [SerializeField] private float rotationSpeed = 2f;
    private float lastRotationSpeedIncreaseTime;
    public GameManagerMult gameManager;

    void Start()
    {
        gameManager = GameObject.FindFirstObjectByType<GameManagerMult>();
        lastRotationSpeedIncreaseTime = Time.time;
    }

    void Update()
    {
        if (!gameManager.IsGameOver())
        {
            axis.y += gravity * Time.deltaTime;
            transform.position += axis * Time.deltaTime;

            if (Input.GetMouseButtonDown(0) || (Input.touchCount > 0 && Input.GetTouch(0).phase == TouchPhase.Began))
            {
                axis = Vector2.up * force;
            }

            // Envia a posição Y para o Firebase (Otimizado)
            if (Mathf.Abs(transform.position.y - lastSentY) > 0.05f) 
            {
                FirebaseManager.Instance.UpdatePlayerPosition(transform.position.y);
                lastSentY = transform.position.y;
            }

            transform.Rotate(Vector3.forward, -rotationSpeed * Time.deltaTime);

            if (Time.time - lastRotationSpeedIncreaseTime >= 2f)
            {
                rotationSpeed++;
                lastRotationSpeedIncreaseTime = Time.time;
            }
        }
    }
    private float lastSentY = -9999f; // Initialize with a value that ensures first update

    public void OnTriggerEnter2D(Collider2D collision)
    {
        if (collision.CompareTag("Obstacles")) { gameManager.PausePlayer2(); }
        if (collision.CompareTag("Scoring")) { gameManager.ScoringPlayer2(); }
    }
}