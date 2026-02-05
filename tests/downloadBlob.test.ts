import { describe, expect, it, vi } from 'vitest';

import { downloadBlob } from '../packages/downloadBlob';

describe('downloadBlob', () => {
  it('creates an object URL, clicks an anchor, and optionally revokes the URL', () => {
    // 在浏览器里这会触发下载；在测试里我们只断言 DOM/URL 的交互行为。
    const createUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    const revokeUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const url = downloadBlob(new Blob(['hello'], { type: 'text/plain' }), 'hello.txt', true);

    expect(url).toBe('blob:mock');
    expect(createUrl).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeUrl).toHaveBeenCalledWith('blob:mock');

    createUrl.mockRestore();
    revokeUrl.mockRestore();
    click.mockRestore();
  });

  it('does not revoke the object URL when autoRevoke is false', () => {
    const createUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    const revokeUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    downloadBlob(new Blob(['hello'], { type: 'text/plain' }), 'hello.txt', false);

    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeUrl).not.toHaveBeenCalled();

    createUrl.mockRestore();
    revokeUrl.mockRestore();
    click.mockRestore();
  });
});
