import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgoFormat',
  standalone: true,
  pure: false,
})
export class TimeAgoFormatPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();

    if (isNaN(date.getTime())) return '';

    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 0) return 'Just now';

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    const minutes = Math.floor(diffInSeconds / 60);

    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days === 1) return 'Yesterday';

    if (days < 7) {
      return `${days} days ago`;
    }

    const weeks = Math.floor(days / 7);

    if (weeks < 4) {
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }

    const months = Math.floor(days / 30);

    if (months < 12) {
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }

    const years = Math.floor(days / 365);

    if (years >= 1) {
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }

    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
