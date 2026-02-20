import { Injectable, inject, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private router = inject(Router);
  private idDesactivadoSubject = new Subject<number>();
  private categoriaCambioSubject = new Subject<any>();

  private stompClient!: Client;
  private platformId = inject(PLATFORM_ID);

  // Guardamos las suscripciones para poder limpiarlas si es necesario
  private subscriptions: StompSubscription[] = [];

  constructor() {
    this.configurarConexion();
  }

  private configurarConexion() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Usamos el endpoint que definiste en Java
    const socket = new SockJS('http://localhost:9090/ws-repro');

    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ Conectado al servidor de WebSockets');
        this.suscribirCanales();
      },
      onStompError: (frame) => {
        console.error('❌ Broker error: ' + frame.headers['message']);
      }
    });

    this.stompClient.activate();
  }

  /**
   * Centraliza todas las suscripciones para que se reactiven al reconectar
   */
  private suscribirCanales() {
    // Limpiamos suscripciones previas para evitar duplicados al reconectar
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];

    const username = localStorage.getItem('username');

    // 1. CANAL DE CATEGORÍAS (General para todos)
    const catSub = this.stompClient.subscribe('/topic/categorias', (message) => {
      try {
        const eventoDto = JSON.parse(message.body);
        console.log('📦 Socket Categoría:', eventoDto);
        this.categoriaCambioSubject.next(eventoDto);
      } catch (e) {
        console.error('Error parseando JSON de categoría', e);
      }
    });
    this.subscriptions.push(catSub);

    // 2. CANALES DE USUARIO (Si está logueado)
    if (username) {
      console.log(`📡 Escuchando canales privados para: ${username}`);

      // Logout forzado
      const logoutSub = this.stompClient.subscribe(`/topic/logout/${username}`, (message) => {
        this.forzarLogout(message.body);
      });
      this.subscriptions.push(logoutSub);

      // Usuarios desactivados (Para la tabla de Admin)
      const userSub = this.stompClient.subscribe('/topic/usuarios-desactivados', (message) => {
        this.idDesactivadoSubject.next(Number(message.body));
      });
      this.subscriptions.push(userSub);
    }
  }

  // --- MÉTODOS PARA COMPONENTES ---

  getDesactivaciones(): Observable<number> {
    return this.idDesactivadoSubject.asObservable();
  }

  getCategoriaCambios(): Observable<any> {
    return this.categoriaCambioSubject.asObservable();
  }

  /**
   * Útil para cuando el usuario hace login: reinicia las suscripciones
   * para activar el canal de logout sin refrescar la página.
   */
  actualizarSuscripcionesPostLogin() {
    if (this.stompClient && this.stompClient.connected) {
      this.suscribirCanales();
    }
  }

  private forzarLogout(mensaje: string) {
    alert(mensaje || 'Tu cuenta ha sido desactivada.');
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
