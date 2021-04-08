import AppError from '@shared/errors/AppErros';

import FakeNotificationsRepository from '@modules/notifications/repositories/fakes/FakeNotificationsRepository';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import FakeAppointmentsRepository from '../repositories/fakes/FakeAppointmentsRepository';
import CreateAppointmentService from './CreateAppointmentService';

let fakeNotificationsRepository: FakeNotificationsRepository;
let fakeAppointmentsRepository: FakeAppointmentsRepository;
let fakeCacheProvider: FakeCacheProvider;
let createAppointment: CreateAppointmentService;

describe('CreateAppointment', () => {
  beforeEach(() => {
    fakeAppointmentsRepository = new FakeAppointmentsRepository();
    fakeNotificationsRepository = new FakeNotificationsRepository();
    fakeCacheProvider = new FakeCacheProvider();

    createAppointment = new CreateAppointmentService(
      fakeAppointmentsRepository,
      fakeNotificationsRepository,
      fakeCacheProvider,
    );
  });

  it('should be able to create a new appointment', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 11, 7, 12).getTime(); // 7-dez-2020 às 12h00
    });

    const appointment = await createAppointment.execute({
      provider_id: '123123',
      user_id: 'user-id',
      date: new Date(2020, 11, 7, 13),
    });

    expect(appointment).toHaveProperty('id');
    expect(appointment.provider_id).toBe('123123');
  });

  it('should not be able to create two appointment on the same time', async () => {
    const appointmentDate = new Date(2020, 11, 7, 12);

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 11, 7, 12).getTime(); // 7-dez-2020 às 12h00
    });

    await createAppointment.execute({
      provider_id: '123123',
      user_id: 'user-id',
      date: appointmentDate,
    });

    expect(
      createAppointment.execute({
        provider_id: '123123',
        user_id: 'user-id',
        date: new Date(2020, 11, 7, 12),
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an appointment on a past date', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 11, 7, 12).getTime(); // 7-dez-2020 às 12h00
    });

    await expect(
      createAppointment.execute({
        provider_id: '123123',
        user_id: 'user-id',
        date: new Date(2020, 11, 7, 11),
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an appointment with same user as provider', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 11, 7, 12).getTime(); // 7-dez-2020 às 12h00
    });

    await expect(
      createAppointment.execute({
        provider_id: 'same-id',
        user_id: 'same-id',
        date: new Date(2020, 11, 7, 13),
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an appointment before 8am and after 5pm', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 11, 7, 12).getTime(); // 7-dez-2020 às 12h00
    });

    await expect(
      createAppointment.execute({
        provider_id: 'provider-id',
        user_id: 'user_id',
        date: new Date(2020, 11, 8, 7),
      }),
    ).rejects.toBeInstanceOf(AppError);

    await expect(
      createAppointment.execute({
        provider_id: 'provider-id',
        user_id: 'user_id',
        date: new Date(2020, 11, 8, 18),
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
