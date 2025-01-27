import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:works_shg_app/data/repositories/muster_roll_repository/muster_roll.dart';
import 'package:works_shg_app/services/urls.dart';
import 'package:works_shg_app/utils/global_variables.dart';

import '../../data/remote_client.dart';
import '../../models/muster_rolls/estimate_muster_roll_model.dart';

part 'muster_roll_estimate.freezed.dart';

typedef MusterRollEstimateEmitter = Emitter<MusterRollEstimateState>;

class MusterRollEstimateBloc
    extends Bloc<MusterRollEstimateEvent, MusterRollEstimateState> {
  MusterRollEstimateBloc() : super(const MusterRollEstimateState.initial()) {
    on<EstimateMusterRollEvent>(_onEstimate);
    on<ViewEstimateMusterRollEvent>(_onViewEstimate);
    on<DisposeEstimateMusterRollEvent>(_onDispose);
  }

  FutureOr<void> _onEstimate(
      EstimateMusterRollEvent event, MusterRollEstimateEmitter emit) async {
    Client client = Client();
    try {
      emit(const MusterRollEstimateState.loading());

      EstimateMusterRollsModel musterRollsModel =
          await MusterRollRepository(client.init()).estimateMusterRolls(
              url: Urls.musterRollServices.musterRollsEstimate,
              body: {
                "musterRoll": {
                  "tenantId": event.tenantId,
                  "registerId": event.registerId,
                  "startDate": event.startDate,
                  "endDate": event.endDate
                }
              },
              options: Options(extra: {
                "accessToken": GlobalVariables.authToken,
                "apiId": "asset-services",
                "msgId": "search with from and to values"
              }));
      await Future.delayed(const Duration(seconds: 1));
      emit(MusterRollEstimateState.loaded(musterRollsModel));
    } on DioError catch (e) {
      emit(const MusterRollEstimateState.loaded(EstimateMusterRollsModel()));
    }
  }

  FutureOr<void> _onDispose(DisposeEstimateMusterRollEvent event,
      MusterRollEstimateEmitter emit) async {
    emit(const MusterRollEstimateState.initial());
  }

  FutureOr<void> _onViewEstimate(
      ViewEstimateMusterRollEvent event, MusterRollEstimateEmitter emit) async {
    Client client = Client();
    try {
      emit(const MusterRollEstimateState.loading());
      EstimateMusterRollsModel musterRollsModel =
          await MusterRollRepository(client.init()).estimateMusterRolls(
              url: Urls.musterRollServices.musterRollsEstimate,
              body: {
                "musterRoll": {
                  "tenantId": event.tenantId,
                  "registerId": event.registerId,
                  "startDate": event.startDate,
                  "endDate": event.endDate
                }
              },
              options: Options(extra: {
                "accessToken": GlobalVariables.authToken,
                "apiId": "asset-services",
                "msgId": "search with from and to values"
              }));
      await Future.delayed(const Duration(seconds: 1));
      emit(MusterRollEstimateState.loaded(musterRollsModel));
    } on DioError catch (e) {

      emit(const MusterRollEstimateState.loaded(EstimateMusterRollsModel()));
    }
  }
}

@freezed
class MusterRollEstimateEvent with _$MusterRollEstimateEvent {
  const factory MusterRollEstimateEvent.estimate({
    required int startDate,
    required int endDate,
    required String registerId,
    required String tenantId,
  }) = EstimateMusterRollEvent;
  const factory MusterRollEstimateEvent.viewEstimate({
    required int startDate,
    required int endDate,
    required String registerId,
    required String tenantId,
  }) = ViewEstimateMusterRollEvent;
  const factory MusterRollEstimateEvent.dispose() =
      DisposeEstimateMusterRollEvent;
}

@freezed
class MusterRollEstimateState with _$MusterRollEstimateState {
  const MusterRollEstimateState._();
  const factory MusterRollEstimateState.initial() = _Initial;
  const factory MusterRollEstimateState.loading() = _Loading;
  const factory MusterRollEstimateState.loaded(
      EstimateMusterRollsModel? musterRollsModel) = _Loaded;
}
